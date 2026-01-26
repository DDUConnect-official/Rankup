import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Award, Play, Pause, Volume2 } from "lucide-react";
import axios from "axios";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import VoiceAssistant from "../components/VoiceAssistant";

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

    // Voice State
    const [playingIndex, setPlayingIndex] = useState(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [loadingIndex, setLoadingIndex] = useState(null);
    const [audioRef] = useState(new Audio());
    const [voiceEnabled, setVoiceEnabled] = useState(false);

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
            className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${isPlaying
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] animate-pulse'
                : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white border border-white/5'
                }`}
            title="Listen"
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (isPlaying && isAudioPlaying) ? (
                <Pause size={18} fill="currentColor" />
            ) : (
                <Play size={18} fill="currentColor" />
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
        <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-cyan-500/30">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            {/* Sticky Navigation */}
            <nav className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 supports-backdrop-filter:bg-[#050505]/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-transparent hover:border-white/10"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back</span>
                    </button>

                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-bold shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                            <Award size={16} />
                            <span>{level.xpReward} XP</span>
                        </div>

                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${voiceEnabled
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                                }`}
                        >
                            <Volume2 size={18} className={voiceEnabled ? "animate-pulse" : ""} />
                            <span className="font-medium">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative max-w-5xl mx-auto px-4 py-10 md:py-16">
                {!showQuiz ? (
                    <div className="animate-slideUpFade">
                        {/* Level Header */}
                        <div className="text-center mb-16 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-mono uppercase tracking-widest mb-4">
                                <span>Level {level.levelNumber || '1'}</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                <span>Theory</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                                {level.title}
                            </h1>
                            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                                {level.description}
                            </p>
                        </div>

                        {/* Content Card */}
                        <div className="relative">
                            <div className="absolute -inset-1 bg-linear-to-b from-blue-500/20 to-purple-500/20 rounded-[2.5rem] blur opacity-75" />
                            <div className="relative bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-4xl p-6 md:p-12 shadow-2xl overflow-hidden">
                                {/* Decorative grid */}
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

                                <div className="relative z-10 space-y-2">
                                    {level.content && level.content.map((paragraph, index) => renderContent(paragraph, index))}
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="mt-12 flex justify-center sticky bottom-8 z-30 pointer-events-none">
                            <div className="pointer-events-auto p-2 bg-[#050505]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex gap-3">
                                {level.hasQuiz ? (
                                    <button
                                        onClick={handleStartQuiz}
                                        className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] cursor-pointer"
                                    >
                                        <span className="relative z-10">Start Quiz Challenge</span>
                                        <CheckCircle size={20} className="relative z-10" />
                                        <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCompleteLevel}
                                        disabled={submitting}
                                        className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.4)] cursor-pointer"
                                    >
                                        {submitting ? "Completing..." : "Complete Level"}
                                        <CheckCircle size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto animate-fadeIn">
                        {!quizCompleted ? (
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-4xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                                        style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                                    />
                                </div>

                                <div className="flex justify-between items-center mb-10">
                                    <span className="text-zinc-400 font-mono text-sm uppercase tracking-widest">Question {currentQuestionIndex + 1}/{quiz.questions.length}</span>
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-300">Passing Score: {quiz.passingScore}%</span>
                                </div>

                                <h3 className="text-3xl font-bold text-white mb-10 leading-tight">
                                    {quiz.questions[currentQuestionIndex].question}
                                </h3>

                                <div className="space-y-4">
                                    {quiz.questions[currentQuestionIndex].options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(idx)}
                                            className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer group flex items-start gap-4 ${userAnswers[currentQuestionIndex] === idx
                                                ? "bg-blue-600/10 border-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.2)]"
                                                : "bg-white/5 border-transparent hover:border-white/20 text-zinc-300 hover:bg-white/10"
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${userAnswers[currentQuestionIndex] === idx ? 'border-blue-500 bg-blue-500' : 'border-white/20 group-hover:border-white/40'
                                                }`}>
                                                {userAnswers[currentQuestionIndex] === idx && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                            <span className="text-lg">{opt}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-12 flex justify-end">
                                    <button
                                        onClick={handleNextQuestion}
                                        disabled={userAnswers[currentQuestionIndex] === undefined || submitting}
                                        className="px-8 py-4 bg-white text-black font-bold rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {currentQuestionIndex === quiz.questions.length - 1 ? (submitting ? "Submitting..." : "Finish Quiz") : "Next Question"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 animate-slideUpFade">
                                <div className="relative inline-block mb-10">
                                    <div className={`absolute inset-0 blur-3xl opacity-50 ${score >= quiz.passingScore ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <div className={`relative w-32 h-32 rounded-4xl flex items-center justify-center text-5xl shadow-2xl border border-white/20 ${score >= quiz.passingScore
                                        ? 'bg-linear-to-br from-green-500 to-emerald-700 text-white'
                                        : 'bg-linear-to-br from-red-500 to-rose-700 text-white'
                                        }`}>
                                        <Award size={64} />
                                    </div>
                                </div>

                                <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
                                    {score >= quiz.passingScore ? "Level Conquered!" : "Level Failed"}
                                </h1>
                                <p className="text-2xl text-zinc-400 mb-12">
                                    You scored <span className={`font-bold ${score >= quiz.passingScore ? "text-emerald-400" : "text-rose-400"}`}>{score}%</span>
                                </p>

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => {
                                            setQuizCompleted(false);
                                            setCurrentQuestionIndex(0);
                                            setUserAnswers({});
                                            setScore(0);
                                            setShowQuiz(false);
                                        }}
                                        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-all cursor-pointer"
                                    >
                                        Review Material
                                    </button>
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all cursor-pointer"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Voice Assistant */}
            <VoiceAssistant context={level?.content} />
        </div>
    );
};


export default LevelContent;
