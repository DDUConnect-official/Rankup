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
    if (loading) return <Loader text="Loading Content..." fullScreen />;
    if (!level) return <div className="text-white text-center mt-20">Level not found.</div>;

    const renderContent = (paragraph, index) => {
        const isPlaying = playingIndex === index;
        const isLoading = loadingIndex === index;

        // Check if paragraph is a heading (starts with ###)
        if (paragraph.startsWith("###")) {
            const headerText = paragraph.replace("### ", "");
            return (
                <div key={index} className="mt-12 mb-8 group relative flex items-center gap-4">
                    <h3 className="flex-1 text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 pb-2 border-b border-white/10">
                        {headerText}
                    </h3>
                    {voiceEnabled && (
                        <VoicePlayButton
                            onClick={() => handlePlayAudio(headerText, index)}
                            isPlaying={isPlaying}
                            isLoading={isLoading}
                            isAudioPlaying={isAudioPlaying}
                        />
                    )}
                </div>
            );
        }

        // Check if paragraph contains table-like content
        if (paragraph.includes("|") || paragraph.includes("↑") || paragraph.includes("---")) {
            return (
                <div key={index} className="my-8 p-6 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto shadow-inner">
                    <pre className="font-mono text-cyan-300 text-sm md:text-base whitespace-pre">{paragraph}</pre>
                </div>
            );
        }

        // Regular paragraph rendering
        return (
            <div key={index} className="mb-8 group relative flex gap-6 items-start">
                {voiceEnabled && (
                    <div className="shrink-0 mt-1">
                        <VoicePlayButton
                            onClick={() => handlePlayAudio(paragraph, index)}
                            isPlaying={isPlaying}
                            isLoading={isLoading}
                            isAudioPlaying={isAudioPlaying}
                        />
                    </div>
                )}
                <p className={`text-lg md:text-xl leading-8 whitespace-pre-line transition-colors duration-300 ${isPlaying ? 'text-blue-100' : 'text-white/80'}`}>
                    {paragraph}
                </p>
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen bg-[#0a0a0a] pb-20">
            <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="hidden md:inline">Back</span>
                    </button>
                    <h2 className="font-bold text-white text-sm md:text-lg truncate max-w-[200px] md:max-w-none">
                        {level.title}
                    </h2>
                    <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${voiceEnabled
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60'
                            }`}
                    >
                        <Volume2 size={14} className={voiceEnabled ? "animate-pulse" : ""} />
                        <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">Voice</span>
                        <div className={`w-6 h-3 rounded-full relative transition-colors ${voiceEnabled ? 'bg-blue-500' : 'bg-white/10'}`}>
                            <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all shadow-sm ${voiceEnabled ? 'left-3.5' : 'left-0.5'}`} />
                        </div>
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-yellow-400 text-xs font-bold">
                        <Award size={14} />
                        {level.xpReward} XP
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 animate-slideUpFade">
                {!showQuiz ? (
                    <>
                        <div className="mb-10 text-center">
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                                {level.title}
                            </h1>
                            <p className="text-white/50 text-lg">{level.description}</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
                            {level.content && level.content.map((paragraph, index) => renderContent(paragraph, index))}
                        </div>

                        <div className="mt-10 flex justify-center">
                            {level.hasQuiz ? (
                                <button
                                    onClick={handleStartQuiz}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all transform hover:scale-105 flex items-center gap-3"
                                >
                                    <CheckCircle size={20} />
                                    Take Quiz & Claim XP
                                </button>
                            ) : (
                                <button
                                    onClick={handleCompleteLevel}
                                    disabled={submitting}
                                    className="px-8 py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all transform hover:scale-105 flex items-center gap-3"
                                >
                                    <CheckCircle size={20} />
                                    {submitting ? "Completing..." : "Complete Level"}
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        {!quizCompleted ? (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl animate-fadeIn">
                                <div className="flex justify-between items-center mb-6 text-white/50 text-sm">
                                    <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                                    <span>Goal: {quiz.passingScore}% to pass</span>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-8">
                                    {quiz.questions[currentQuestionIndex].question}
                                </h3>

                                <div className="space-y-4">
                                    {quiz.questions[currentQuestionIndex].options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(idx)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all ${userAnswers[currentQuestionIndex] === idx
                                                ? "bg-blue-500/20 border-blue-500 text-blue-200"
                                                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={handleNextQuestion}
                                        disabled={userAnswers[currentQuestionIndex] === undefined || submitting}
                                        className="px-6 py-3 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                                    >
                                        {currentQuestionIndex === quiz.questions.length - 1 ? (submitting ? "Submitting..." : "Submit Quiz") : "Next Question"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 animate-slideUpFade">
                                <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 mb-6 shadow-[0_0_40px_rgba(59,130,246,0.5)]">
                                    <Award size={48} className="text-white" />
                                </div>
                                <h2 className="text-4xl font-bold text-white mb-2">
                                    {score >= quiz.passingScore ? "Level Complete!" : "Keep Trying!"}
                                </h2>
                                <p className="text-white/60 text-lg mb-8">
                                    You scored <span className={`font-bold ${score >= quiz.passingScore ? "text-green-400" : "text-red-400"}`}>{score}%</span>
                                </p>

                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-all"
                                >
                                    Back to Levels
                                </button>
                            </div>
                        )}
                    </div>
<<<<<<< HEAD
                )}
            </div>
=======
                 )}

             </div>
             
             {/* Voice Assistant */}
             <VoiceAssistant context={level?.theory} />
>>>>>>> bf02de34b1e127198ca346620141fc7fce422ca0
        </div>
    );
};

export default LevelContent;
