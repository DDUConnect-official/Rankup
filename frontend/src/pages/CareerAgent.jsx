import React, { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Bot, Target, Zap, ChevronLeft, Send, BrainCircuit,
    RefreshCw, Flame, Trophy, AlertCircle, MessageSquare,
    ChevronRight, Mic, MicOff
} from "lucide-react";
import ReactMarkdown from "react-markdown";

/* ──────────────────────────────────────────────
   Section config — maps AI section title → theme
   ────────────────────────────────────────────── */
const SECTION_CONFIGS = [
    {
        match: "Where You Stand",
        emoji: "🎯",
        label: "Where You Stand",
        border: "border-purple-500/25",
        headerBg: "bg-purple-500/10",
        glow: "from-purple-500/10 to-transparent",
        badge: "bg-purple-500/15 text-purple-300 border-purple-500/25",
        dot: "bg-purple-400",
    },
    {
        match: "Immediate Next Steps",
        emoji: "🚀",
        label: "Immediate Next Steps",
        border: "border-blue-500/25",
        headerBg: "bg-blue-500/10",
        glow: "from-blue-500/10 to-transparent",
        badge: "bg-blue-500/15 text-blue-300 border-blue-500/25",
        dot: "bg-blue-400",
    },
    {
        match: "30-Day Growth Plan",
        emoji: "📈",
        label: "30-Day Growth Plan",
        border: "border-emerald-500/25",
        headerBg: "bg-emerald-500/10",
        glow: "from-emerald-500/10 to-transparent",
        badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
        dot: "bg-emerald-400",
    },
    {
        match: "Career Path Suggestion",
        emoji: "💼",
        label: "Career Path",
        border: "border-orange-500/25",
        headerBg: "bg-orange-500/10",
        glow: "from-orange-500/10 to-transparent",
        badge: "bg-orange-500/15 text-orange-300 border-orange-500/25",
        dot: "bg-orange-400",
    },
    {
        match: "Quick Wins",
        emoji: "⚡",
        label: "Quick Wins",
        border: "border-yellow-500/25",
        headerBg: "bg-yellow-500/10",
        glow: "from-yellow-500/10 to-transparent",
        badge: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
        dot: "bg-yellow-400",
    },
];

/* ── Parse AI markdown into sections ── */
function parseAdviceSections(markdown) {
    if (!markdown) return [];
    const parts = markdown.split(/(?=###\s)/);
    return parts
        .map(part => {
            const titleMatch = part.match(/^###\s+(.+)/);
            if (!titleMatch) return null;
            const rawTitle = titleMatch[1].trim();
            const content = part.replace(/^###\s+.+\n?/, "").trim();
            const config = SECTION_CONFIGS.find(c =>
                rawTitle.toLowerCase().includes(c.match.toLowerCase())
            ) || {
                emoji: "📌", label: rawTitle, border: "border-white/10",
                headerBg: "bg-white/5", glow: "from-white/5 to-transparent",
                badge: "bg-white/10 text-white/60 border-white/10", dot: "bg-white/40"
            };
            return { title: rawTitle, content, config };
        })
        .filter(Boolean);
}

/* ── Sparkle particles ── */
const Sparkles = () => (
    <div className="absolute bottom-0 left-0 w-full h-28 overflow-hidden pointer-events-none z-0">
        {[...Array(18)].map((_, i) => (
            <div
                key={i}
                className={`animate-sparkle rounded-full absolute bottom-0 ${["bg-purple-400", "bg-blue-400", "bg-pink-400", "bg-cyan-400", "bg-indigo-400"][i % 5]}`}
                style={{
                    left: `${(i * 5.5) % 100}%`,
                    width: `${(i % 3) + 3}px`,
                    height: `${(i % 3) + 3}px`,
                    animationDuration: `${8 + (i % 5)}s`,
                    animationDelay: `${(i * 0.3) % 5}s`,
                    opacity: 0.3 + (i % 3) * 0.15,
                }}
            />
        ))}
    </div>
);

/* ── Stat chip ── */
const StatChip = ({ icon, value, label }) => (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 min-w-17">
        {icon}
        <span className="text-lg font-bold text-white leading-none">{value}</span>
        <span className="text-[9px] uppercase tracking-widest text-white/40">{label}</span>
    </div>
);

/* ── Section card ── */
const SectionCard = ({ title, content, config, fullWidth = false }) => (
    <div className={`relative rounded-2xl bg-black/20 border ${config.border} overflow-hidden flex flex-col ${fullWidth ? "col-span-full" : ""}`}>
        {/* Top gradient accent */}
        <div className={`absolute top-0 left-0 w-full h-24 bg-linear-to-b ${config.glow} pointer-events-none`} />

        {/* Header */}
        <div className={`flex items-center gap-3 px-5 py-4 ${config.headerBg} border-b ${config.border}`}>
            <span className="text-xl">{config.emoji}</span>
            <span className="font-bold text-white text-sm tracking-wide">{title.replace(/^[\p{Emoji}\s]+/u, "").trim()}</span>
            <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border ${config.badge}`}>
                {config.label}
            </span>
        </div>

        {/* Content */}
        <div className="relative z-10 px-5 py-4 text-sm leading-relaxed
            prose prose-invert max-w-none
            prose-p:text-white/70 prose-p:my-1.5
            prose-li:text-white/70 prose-li:my-0.5 prose-li:marker:text-white/30
            prose-strong:text-white/90
            prose-headings:hidden
            prose-ul:my-2 prose-ol:my-2">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    </div>
);

/* ── Skeleton ── */
const SkeletonLoader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className={`rounded-2xl bg-black/20 border border-white/5 overflow-hidden ${i === 0 ? "col-span-full" : ""}`}>
                <div className="h-12 bg-white/5 border-b border-white/5" />
                <div className="p-5 flex flex-col gap-2.5">
                    <div className="h-3.5 bg-white/8 rounded w-full" />
                    <div className="h-3.5 bg-white/8 rounded w-4/5" />
                    <div className="h-3.5 bg-white/8 rounded w-3/5" />
                </div>
            </div>
        ))}
    </div>
);

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */
const CareerAgent = () => {
    const { profileData } = useOutletContext();
    const navigate = useNavigate();
    const chatBottomRef = useRef(null);
    const recognitionRef = useRef(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [advice, setAdvice] = useState("");
    const [sections, setSections] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Chat
    const [question, setQuestion] = useState("");
    const [askingFollowUp, setAskingFollowUp] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [isListening, setIsListening] = useState(false);

    /* Generate smart auto-question based on user stats */
    const buildAgentQuestion = (sum) => {
        if (!sum) return "Which part of your learning path would you like to explore further? 🤔";
        if (sum.levelsCompleted === 0) return "You're just getting started! Which area excites you most — **JavaScript**, **Python**, or **HTML/CSS**? Tell me your goal and I'll build a path for you. 🚀";
        if (sum.dsaCompleted === 0) return "I notice you haven't started the **100 Days of DSA** challenge yet. Want me to explain why DSA is critical for tech interviews and how to begin? 🎯";
        if (sum.currentStreak > 0) return `You're on a **${sum.currentStreak}-day streak** — amazing! What role are you ultimately targeting — **Frontend**, **Backend**, or **Full Stack** developer? 💼`;
        return "Which of the career paths I suggested interests you most? I can go much deeper on any of them! 💡";
    };

    const fetchAdvice = async () => {
        if (!profileData?.uid) {
            setError("Could not identify your account. Please refresh the page.");
            setLoading(false);
            return;
        }
        try {
            setError(null);
            const res = await axios.post(`${backendUrl}/api/ai/career-advice`, {
                userId: profileData.uid,
            });
            const rawAdvice = res.data.advice || "";
            const sum = res.data.summary || null;
            setAdvice(rawAdvice);
            setSummary(sum);
            setSections(parseAdviceSections(rawAdvice));

            // Auto-inject agent's first question (GPT-like engagement)
            setTimeout(() => {
                setChatHistory([{ q: null, a: buildAgentQuestion(sum) }]);
            }, 800);
        } catch (err) {
            console.error("Career advice error:", err);
            setError(err.response?.data?.message || "Failed to generate career advice. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAdvice();
    }, [profileData?.uid]);

    const handleRefresh = () => {
        setRefreshing(true);
        setLoading(true);
        setAdvice("");
        setSections([]);
        setChatHistory([]);
        fetchAdvice();
    };

    /* Voice input */
    const toggleVoice = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const rec = new SR();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";
        recognitionRef.current = rec;
        setIsListening(true);
        rec.start();

        rec.onresult = (e) => {
            const text = e.results[0][0].transcript;
            setQuestion(prev => (prev + " " + text).trim());
        };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
    };

    /* Send follow-up */
    const handleAskFollowUp = async () => {
        const q = question.trim();
        if (!q || askingFollowUp) return;
        setQuestion("");
        setAskingFollowUp(true);
        setChatHistory(prev => [...prev, { q, a: null }]);

        try {
            const res = await axios.post(`${backendUrl}/api/ai/career-followup`, {
                userId: profileData.uid,
                question: q,
                previousAdvice: advice,
            });
            // Set answer, then append a separate agent follow-up bubble
            setChatHistory(prev => {
                const updated = prev.map((item, i) =>
                    i === prev.length - 1 ? { ...item, a: res.data.answer || "" } : item
                );
                return [...updated, { q: null, a: "*Is there anything else about your learning path you'd like to explore?* 💡" }];
            });
        } catch {
            setChatHistory(prev =>
                prev.map((item, i) =>
                    i === prev.length - 1 ? { ...item, a: "Sorry, couldn't answer that. Please try again." } : item
                )
            );
        } finally {
            setAskingFollowUp(false);
            setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col md:p-2 animate-slideUpFade">
            <div className="w-full py-6 px-4 md:p-10 rounded-xl border border-white/10 backdrop-blur-2xl shadow-xl">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/40 hover:text-white/70 mb-8 transition-colors group text-sm"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="flex flex-col gap-5">

                    {/* ── HEADER CARD ── */}
                    <div className="relative p-1 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm overflow-hidden">
                        {/* Corner glow lines */}
                        <div className="absolute top-0 right-0 w-44 h-44 pointer-events-none overflow-hidden z-0 opacity-70">
                            <div className="absolute top-0 right-0 w-full h-[1.5px] bg-linear-to-l from-purple-500 via-pink-500 to-transparent" />
                            <div className="absolute top-0 right-0 w-[1.5px] h-full bg-linear-to-b from-purple-500 via-pink-500 to-transparent" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-44 h-44 pointer-events-none overflow-hidden z-0 opacity-70">
                            <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-linear-to-r from-blue-500 via-cyan-500 to-transparent" />
                            <div className="absolute bottom-0 left-0 w-[1.5px] h-full bg-linear-to-t from-blue-500 via-cyan-500 to-transparent" />
                        </div>

                        <Sparkles />

                        <div className="relative z-10 p-5 md:p-8 flex flex-col md:flex-row items-center gap-6">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border border-white/10 bg-black/60 flex items-end justify-center overflow-hidden">
                                    <img
                                        src="https://res.cloudinary.com/dgbsqglrc/image/upload/v1768656327/CarrerAgent__Avtar-removebg-preview_ehwe5v.png"
                                        alt="Career Agent"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 border-2 border-black animate-pulse" />
                            </div>

                            {/* Title + desc */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1.5">
                                    RankUp{" "}
                                    <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">
                                        Career Agent
                                    </span>
                                </h1>
                                <p className="text-white/50">Your AI mentor for technical growth and career success.</p>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-3 shrink-0">
                                <StatChip icon={<Target className="w-4 h-4 text-purple-400" />} value={summary?.levelsCompleted ?? 0} label="Levels" />
                                <StatChip icon={<Zap className="w-4 h-4 text-yellow-400" />} value={summary?.totalScore ?? 0} label="Score" />
                                <StatChip icon={<Trophy className="w-4 h-4 text-blue-400" />} value={summary?.dsaCompleted ?? 0} label="DSA" />
                                <StatChip icon={<Flame className="w-4 h-4 text-orange-400" />} value={summary?.currentStreak ?? 0} label="Streak" />
                            </div>
                        </div>
                    </div>

                    {/* ── LEARNING PATH HEADER ── */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <BrainCircuit className="w-5 h-5 text-purple-400" />
                            <h2 className="text-base font-bold text-white">Personalized Learning Path</h2>
                        </div>
                        {!loading && !error && (
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white/80 text-xs transition-all disabled:opacity-40"
                            >
                                <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                        )}
                    </div>

                    {/* ── SECTION CARDS ── */}
                    {loading ? (
                        <SkeletonLoader />
                    ) : error ? (
                        <div className="flex flex-col items-center gap-4 p-10 text-center rounded-2xl bg-black/20 border border-red-500/20">
                            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <AlertCircle className="w-7 h-7 text-red-400" />
                            </div>
                            <div>
                                <p className="text-white font-semibold mb-1">Couldn't load career advice</p>
                                <p className="text-white/40 text-sm max-w-md">{error}</p>
                            </div>
                            <button
                                onClick={fetchAdvice}
                                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-all active:scale-95"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : sections.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sections.map((sec, i) => (
                                <SectionCard
                                    key={i}
                                    title={sec.title}
                                    content={sec.content}
                                    config={sec.config}
                                    fullWidth={i === 0}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Fallback: raw markdown if parsing fails */
                        <div className="rounded-2xl bg-black/20 border border-white/5 px-6 py-5 text-sm leading-relaxed
                            prose prose-invert max-w-none prose-headings:text-white prose-p:text-white/70 prose-li:text-white/70">
                            <ReactMarkdown>{advice}</ReactMarkdown>
                        </div>
                    )}

                    {/* ── CHAT / FOLLOW-UP ── */}
                    {!loading && !error && advice && (
                        <div className="relative rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-2.5 px-5 md:px-7 pt-5 pb-3.5 border-b border-white/5">
                                <MessageSquare className="w-4 h-4 text-blue-400" />
                                <h2 className="text-sm font-bold text-white">Career Agent Chat</h2>
                                <span className="flex items-center gap-1.5 ml-auto text-[10px] text-green-400 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Online
                                </span>
                            </div>

                            {/* Chat history */}
                            <div className="px-3 md:px-7 pt-4 pb-2 flex flex-col gap-4 max-h-130 overflow-y-auto scrollbar-thin">
                                {chatHistory.map((item, idx) => (
                                    <div key={idx} className="flex flex-col gap-3">
                                        {/* User question — always on top */}
                                        {item.q !== null && (
                                            <div className="flex justify-end">
                                                <div className="max-w-[80%] px-3 md:px-4 py-2.5 rounded-2xl rounded-br-sm bg-purple-600/20 border border-purple-500/20 text-white/90 text-sm wrap-break-word">
                                                    {item.q}
                                                </div>
                                            </div>
                                        )}
                                        {/* Agent reply — below the user message */}
                                        {(item.q === null || item.a !== null) && (
                                            <div className="flex gap-2 md:gap-3 items-start">
                                                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Bot className="w-3 h-3 md:w-3.5 md:h-3.5 text-purple-400" />
                                                </div>
                                                {item.a === null ? (
                                                    <div className="flex gap-1.5 items-center px-3 py-3 rounded-2xl rounded-bl-sm bg-white/5 border border-white/10">
                                                        {[0, 1, 2].map(i => (
                                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="min-w-0 flex-1 px-3 md:px-4 py-3 rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 text-white/75 text-sm prose prose-invert prose-p:my-1.5 prose-li:my-0.5 prose-strong:text-white/90 overflow-hidden">
                                                        <ReactMarkdown>{item.a}</ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={chatBottomRef} />
                            </div>

                            {/* Input row */}
                            <div className="flex items-center gap-2 px-3 md:px-6 py-3 md:py-4 border-t border-white/5">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={e => setQuestion(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleAskFollowUp()}
                                    placeholder="Ask your career agent..."
                                    className="flex-1 min-w-0 px-3 md:px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-purple-500/50 transition-colors"
                                />

                                {/* Voice button */}
                                <button
                                    onClick={toggleVoice}
                                    title={isListening ? "Stop listening" : "Voice input"}
                                    className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${
                                        isListening
                                            ? "border-red-500/40 bg-red-500/15 text-red-400 animate-pulse"
                                            : "border-white/10 bg-black/60 text-white/50 hover:text-white/80"
                                    }`}
                                >
                                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </button>

                                {/* Send button */}
                                <button
                                    onClick={handleAskFollowUp}
                                    disabled={!question.trim() || askingFollowUp}
                                    className="relative overflow-hidden shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-black/60 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    {askingFollowUp ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    <div className="shine-overlay shine-effect" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── FOOTER ACTIONS ── */}
                    <div className="flex flex-col md:flex-row items-center gap-3 pt-1">
                        <div className="flex-1 flex items-center gap-2 text-white/25 text-xs italic">
                            <Bot className="w-3.5 h-3.5 shrink-0" />
                            Advice generated from your real-time RankUp performance.
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={() => navigate("/dsa-challenge")}
                                className="relative overflow-hidden flex-1 md:flex-none px-6 py-3 rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm text-white font-bold text-sm flex items-center justify-center gap-2 group/btn transition-all active:scale-[0.98]"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Go to DSA
                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                </span>
                                <div className="shine-overlay shine-effect" />
                            </button>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="relative overflow-hidden flex-1 md:flex-none px-6 py-3 rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm text-white font-bold text-sm flex items-center justify-center gap-2 group/btn transition-all active:scale-[0.98]"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Dashboard
                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                </span>
                                <div className="shine-overlay shine-effect" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CareerAgent;
