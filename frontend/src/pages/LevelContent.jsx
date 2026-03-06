import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Award, Play, Pause, Volume2, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import axios from "axios";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import AiSidebar from "../components/AiSidebar";

const LevelContent = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    // Level & Quiz State
    const [level, setLevel] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    // Quiz Progress State
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [isPractice, setIsPractice] = useState(false);
    const [isMastered, setIsMastered] = useState(false);
    const [awardedXP, setAwardedXP] = useState(0);
    const [passingScore, setPassingScore] = useState(70);

    // Voice State
    const [playingIndex, setPlayingIndex] = useState(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [loadingIndex, setLoadingIndex] = useState(null);
    const [audioRef] = useState(new Audio());
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);

    // Initialize sidebar based on screen size
    useEffect(() => {
        if (window.innerWidth >= 1024) {
            setIsAiSidebarOpen(true);
        }
    }, []);

    // Audio Cleanup
    useEffect(() => {
        const onEnded = () => setIsAudioPlaying(false);
        audioRef.addEventListener('ended', onEnded);
        return () => {
            audioRef.removeEventListener('ended', onEnded);
            audioRef.pause();
            audioRef.src = "";
        };
    }, [audioRef]);

    // Audio Handlers
    const handlePlayAudio = async (text, index) => {
        if (playingIndex === index) {
            if (isAudioPlaying) {
                audioRef.pause();
                setIsAudioPlaying(false);
            } else {
                if (audioRef.src) {
                    audioRef.play().catch(e => console.error(e));
                    setIsAudioPlaying(true);
                } else {
                    loadAndPlay(text, index);
                }
            }
            return;
        }
        loadAndPlay(text, index);
    };

    const loadAndPlay = async (text, index) => {
        audioRef.pause();
        setIsAudioPlaying(false);

        setPlayingIndex(index);
        setLoadingIndex(index);

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/student/synthesize`, {
                text,
                voiceId: 'en-US-marcus'
            });

            if (res.data.audioUrl) {
                audioRef.src = res.data.audioUrl;
                audioRef.play().then(() => {
                    setIsAudioPlaying(true);
                }).catch(err => {
                    console.error("Playback error", err);
                });
            }
        } catch (err) {
            console.error("Audio synthesis failed", err);
            setPlayingIndex(null);
        } finally {
            setLoadingIndex(null);
        }
    };

    // Data Fetching
    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Fetch Level
                const levelRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/level/${levelId}`);
                setLevel(levelRes.data);

                // Fetch Quiz
                if (levelRes.data.hasQuiz) {
                    try {
                        const quizRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/quiz/${levelId}`);
                        setQuiz(quizRes.data);
                    } catch (err) {
                        console.log("No quiz found or error fetching quiz", err);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch level content", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [levelId]);

    // Quiz Handlers
    const handleStartQuiz = () => {
        setIsAiSidebarOpen(false);
        setShowQuiz(true);
        window.scrollTo(0, 0);
        audioRef.pause();
        setIsAudioPlaying(false);
    };

    const handleOptionSelect = (optionIndex) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: optionIndex
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmitQuiz();
        }
    };

    const handleSubmitQuiz = async () => {
        setSubmitting(true);
        let calculatedScore = 0;
        let correctCount = 0;

        quiz.questions.forEach((q, index) => {
            const selectedOption = q.options[userAnswers[index]];
            if (selectedOption === q.correctAnswer) {
                correctCount++;
            }
        });

        calculatedScore = Math.round((correctCount / quiz.questions.length) * 100);
        setScore(calculatedScore);

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/student/quiz/submit`, {
                userId: user.uid || user._id,
                levelId,
                score: calculatedScore
            });
            console.log("Quiz submitted:", res.data);
            setIsPractice(res.data.alreadyCompleted);
            setIsMastered(res.data.isMastered);
            setAwardedXP(res.data.awardedXP);
            setPassingScore(res.data.passingScore || 70);
            setQuizCompleted(true);
        } catch (err) {
            console.error("Error submitting quiz", err);
            alert("Failed to save progress. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCompleteLevel = async () => {
        setSubmitting(true);
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/student/quiz/submit`, {
                userId: user.uid || user._id,
                levelId,
                score: 100
            });
            navigate(-1);
        } catch (err) {
            console.error("Error completing level", err);
            alert("Failed to save progress.");
        } finally {
            setSubmitting(false);
        }
    };

    // Component: VoicePlayButton
    const VoicePlayButton = ({ onClick, isPlaying, isLoading, isAudioPlaying }) => (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${isPlaying
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
            title="Listen"
        >
            {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (isPlaying && isAudioPlaying) ? (
                <Pause size={16} fill="currentColor" />
            ) : (
                <Play size={16} fill="currentColor" />
            )}
        </button>
    );

    // Guard Clauses
    // Helper for Code Block Copy
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    if (loading) return <Loader text="Loading Content..." fullScreen />;
    if (!level) return <div className="text-white text-center mt-20">Level not found.</div>;

    const renderContent = (block, index) => {
        // Compatibility: Handle old plain string blocks
        if (typeof block === 'string') {
            if (block.startsWith("###")) {
                const headerText = block.replace("### ", "");
                return (
                    <div key={index} className="mt-8 mb-6">
                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400 inline-block">
                            {headerText}
                        </h3>
                    </div>
                );
            }
            return <p key={index} className="mb-6 text-lg text-zinc-300 leading-relaxed whitespace-pre-line">{block}</p>;
        }

        const { type, title, data } = block;
        const isPlaying = playingIndex === index;
        const isLoading = loadingIndex === index;
        const voiceText = `${title || ''}. ${data || ''}`;

        return (
            <div key={index} className="mb-8 last:mb-0 group">
                {/* Title */}
                {title && (
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <div className={`w-1.5 h-8 rounded-full bg-linear-to-b from-blue-500 to-cyan-400 transition-all ${isPlaying ? 'h-12' : 'h-8'}`} />
                        {title}
                    </h3>
                )}

                <div className="flex gap-4 items-start">
                    {/* Voice Button */}
                    {voiceEnabled && (
                        <div className="shrink-0 mt-1">
                            <VoicePlayButton
                                onClick={() => handlePlayAudio(voiceText, index)}
                                isPlaying={isPlaying}
                                isLoading={isLoading}
                                isAudioPlaying={isAudioPlaying}
                            />
                        </div>
                    )}

                    {/* Content Body */}
                    <div className="flex-1 min-w-0"> {/* min-w-0 ensures text wrap */}

                        {/* PARAGRAPH */}
                        {type === 'paragraph' && (
                            <p className={`text-lg leading-8 transition-colors duration-300 ${isPlaying ? 'text-blue-200' : 'text-zinc-300'}`}>
                                {data}
                            </p>
                        )}

                        {/* LIST */}
                        {type === 'bullet' && (
                            <ul className="space-y-4 my-2">
                                {data.split('\n').filter(line => line.trim()).map((line, i) => (
                                    <li key={i} className={`flex items-start gap-4 p-3 rounded-xl transition-all ${isPlaying ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5 border border-white/5 hover:border-white/10'}`}>
                                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400">
                                            <div className="w-2 h-2 rounded-full bg-current" />
                                        </div>
                                        <span className={`text-lg ${isPlaying ? 'text-blue-100' : 'text-zinc-300'}`}>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* CODE EXAMPLE */}
                        {type === 'example' && (
                            <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-[#0F1117] shadow-2xl group/code">
                                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Code Example</span>
                                </div>
                                <div className="p-6 overflow-x-auto relative">
                                    <pre className="font-mono text-cyan-300 text-sm md:text-base whitespace-pre leading-relaxed">{data}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] 2xl:h-[calc(100vh-9rem)] bg-[#050505] text-zinc-100 selection:bg-cyan-500/30 overflow-hidden rounded-t-4xl md:rounded-t-[3rem]">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                {/* Sticky Navigation */}
                <nav className="h-19 shrink-0 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-transparent hover:border-white/10"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                            <Award size={14} />
                            <span>{level.xpReward} XP</span>
                        </div>

                        {!showQuiz && (
                            <button
                                onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
                                className="p-2 rounded-lg border border-blue-500/50 text-blue-400 bg-blue-500/10 lg:hidden"
                            >
                                <MessageSquare size={18} />
                            </button>
                        )}
                    </div>
                </nav>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-thin scrollbar-thumb-white/10">
                    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
                        {!showQuiz ? (
                            <div className="space-y-12 md:space-y-20">
                                <header className="text-center max-w-3xl mx-auto relative">
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full" />
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 animate-slideUpFade">
                                        Module {level.levelNumber}
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black text-white title-glow tracking-tight leading-tight mb-6 animate-slideUpFade">
                                        {level.title}
                                    </h1>
                                    <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed animate-slideUpFade [animation-delay:200ms]">
                                        {level.description}
                                    </p>
                                </header>

                                <div className="group/card relative">
                                    {/* Glass Decor */}
                                    <div className="absolute -inset-4 bg-linear-to-b from-blue-500/5 to-purple-500/5 rounded-[3rem] blur-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />

                                    <div className="relative bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-14 shadow-2xl">
                                        {/* Grid background */}
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

                                        <div className="relative z-10 space-y-4">
                                            {level.content && level.content.map((paragraph, index) => renderContent(paragraph, index))}
                                        </div>
                                    </div>
                                </div>

                                {/* Quiz Action */}
                                <div className="mt-16 flex justify-center">
                                    {level.hasQuiz ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <button
                                                onClick={handleStartQuiz}
                                                className="group relative px-10 py-4 bg-white text-black font-black text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] cursor-pointer"
                                            >
                                                <span>Master This Level</span>
                                                <CheckCircle size={22} />
                                            </button>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                                                Mastery Target: {quiz?.passingScore || 70}% Score
                                            </p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleCompleteLevel}
                                            disabled={submitting}
                                            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.3)] cursor-pointer"
                                        >
                                            {submitting ? "Processing..." : "Finish Level"}
                                            <CheckCircle size={22} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fadeIn w-full max-w-5xl mx-auto">
                                {!quizCompleted ? (
                                    <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between items-center mb-10">
                                            <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Progress: {currentQuestionIndex + 1}/{quiz.questions.length}</span>
                                            <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 italic">Target: {quiz.passingScore}%</span>
                                        </div>

                                        <h3 className="text-xl md:text-3xl font-black text-white mb-6 md:mb-10 leading-snug">
                                            {quiz.questions[currentQuestionIndex].question}
                                        </h3>

                                        <div className="space-y-4">
                                            {quiz.questions[currentQuestionIndex].options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleOptionSelect(idx)}
                                                    className={`w-full text-left px-5 py-4 md:px-8 md:py-7 rounded-2xl md:rounded-4xl border-2 transition-all duration-300 cursor-pointer group flex items-start gap-4 md:gap-6 ${userAnswers[currentQuestionIndex] === idx
                                                        ? "bg-blue-600/10 border-blue-500 text-white shadow-[0_0_40px_rgba(37,99,235,0.1)]"
                                                        : "bg-white/5 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white"
                                                        }`}
                                                >
                                                    <div className={`w-6 h-6 md:w-7 md:h-7 rounded-lg md:rounded-xl border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${userAnswers[currentQuestionIndex] === idx ? 'border-blue-500 bg-blue-500 scale-110' : 'border-zinc-700 group-hover:border-zinc-500 group-hover:bg-white/5'
                                                        }`}>
                                                        {userAnswers[currentQuestionIndex] === idx && <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-white animate-in zoom-in" />}
                                                    </div>
                                                    <span className="text-base md:text-xl font-bold tracking-tight">{opt}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-12 flex justify-end">
                                            <button
                                                onClick={handleNextQuestion}
                                                disabled={userAnswers[currentQuestionIndex] === undefined || submitting}
                                                className="px-10 py-4 bg-white text-black font-black rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 cursor-pointer shadow-xl"
                                            >
                                                {currentQuestionIndex === quiz.questions.length - 1 ? (submitting ? "Finalizing..." : "Submit Answers") : "Next Challenge"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 animate-slideUpFade">
                                        <div className="relative inline-block mb-8 md:mb-12">
                                            <div className={`absolute inset-0 blur-3xl opacity-30 ${score >= (passingScore || 70) ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <div className={`relative w-28 h-28 md:w-40 md:h-40 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center shadow-2xl border-4 ${score >= (passingScore || 70)
                                                ? 'bg-[#0A0A0A] border-emerald-500 text-emerald-500'
                                                : 'bg-[#0A0A0A] border-red-500 text-red-500'
                                                }`}>
                                                <Award size={40} className="md:w-20 md:h-20" strokeWidth={1} />
                                            </div>
                                        </div>

                                        <h1 className="text-3xl md:text-7xl font-black text-white mb-4 md:mb-6 tracking-tighter">
                                            {isMastered
                                                ? (isPractice ? "PRACTICE COMPLETED" : "LEVEL MASTERED")
                                                : "NEEDS PRACTICE"}
                                        </h1>
                                        <p className="text-base md:text-2xl text-zinc-500 mb-10 md:mb-14 font-medium uppercase tracking-[0.2em] md:tracking-[0.3em]">
                                            Performance: <span className={isMastered ? "text-emerald-400" : "text-rose-400"}>{score}%</span>
                                            {isMastered && awardedXP > 0 && <span className="ml-4 text-yellow-500">+{awardedXP} XP</span>}
                                            {isMastered && awardedXP === 0 && isPractice && <span className="ml-4 text-zinc-500">(Already Mastered)</span>}
                                        </p>
                                        {!isMastered && (
                                            <p className="text-sm text-zinc-600 mb-10 -mt-8 bg-zinc-950/50 py-3 px-6 rounded-xl inline-block border border-white/5 uppercase tracking-widest font-bold">
                                                Mastery Target: {passingScore}%
                                            </p>
                                        )}

                                        <div className="flex flex-col md:flex-row justify-center gap-6">
                                            <button
                                                onClick={() => {
                                                    setQuizCompleted(false);
                                                    setCurrentQuestionIndex(0);
                                                    setUserAnswers({});
                                                    setScore(0);
                                                    setShowQuiz(false);
                                                }}
                                                className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all cursor-pointer uppercase tracking-widest text-sm"
                                            >
                                                Review Lesson
                                            </button>
                                            <button
                                                onClick={() => navigate(-1)}
                                                className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all cursor-pointer uppercase tracking-widest text-sm shadow-xl"
                                            >
                                                Back to Modules
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* AI Sidebar */}
            <div className={`fixed inset-y-0 right-0 z-[100] lg:relative lg:z-10 transition-all duration-500 ease-in-out ${isAiSidebarOpen && !showQuiz ? 'w-full lg:w-[380px] opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
                <AiSidebar
                    context={level?.content}
                    isOpen={isAiSidebarOpen && !showQuiz}
                    onClose={() => setIsAiSidebarOpen(false)}
                />
            </div>

            {/* Desktop FAB to reopen if closed */}
            {!isAiSidebarOpen && !showQuiz && (
                <button
                    onClick={() => setIsAiSidebarOpen(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 animate-in zoom-in cursor-pointer"
                >
                    <Sparkles size={24} />
                </button>
            )}
        </div>
    );
};


export default LevelContent;
