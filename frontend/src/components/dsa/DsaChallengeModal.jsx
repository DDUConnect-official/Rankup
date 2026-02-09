import React, { useState, useEffect } from "react";
import { X, Code2, Lightbulb, CheckCircle2, XCircle, Loader2, Flame, Zap, Terminal, Medal } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import CodeEditor from '@uiw/react-textarea-code-editor';

import jsLogo from "../../assets/js.png";
import cLogo from "../../assets/cprogramming.png";
import cppLogo from "../../assets/cpp.png";
import javaLogo from "../../assets/java.png";

const DsaChallengeModal = ({ isOpen, onClose, userId }) => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [challengeData, setChallengeData] = useState(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [explanation, setExplanation] = useState("");
    const [result, setResult] = useState(null);
    const [compiling, setCompiling] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            fetchChallenge();
        }
    }, [isOpen, userId]);

    const fetchChallenge = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dsa/today/${userId}`);
            setChallengeData(response.data);

            if (response.data.hasStarted && response.data.challenge) {
                setCode(getCodeTemplate(language, response.data.challenge.title));
            }
        } catch (error) {
            console.error("Failed to fetch challenge:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChallenge = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/dsa/start/${userId}`);
            fetchChallenge();
        } catch (error) {
            console.error("Failed to start challenge:", error);
        }
    };

    const handleAction = async (isCompile = false) => {
        if (!code.trim()) {
            return;
        }

        if (!isCompile && !explanation.trim()) {
            return;
        }

        try {
            if (isCompile) setCompiling(true);
            else setSubmitting(true);

            setResult(null);

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/dsa/submit/${userId}`,
                {
                    challengeId: challengeData.challenge._id,
                    code,
                    explanation,
                    language,
                    isCompile
                }
            );

            setResult(response.data);
        } catch (error) {
            console.error("Action failed:", error);
            setResult({
                isCompile,
                error: true,
                evaluation: {
                    totalScore: 0,
                    feedback: "Service unavailable. Please try again later.",
                    syntaxErrors: ["Connection failed"]
                }
            });
        } finally {
            setCompiling(false);
            setSubmitting(false);
        }
    };

    const getCodeTemplate = (lang, title) => {
        const templates = {
            javascript: `// ${title}\nfunction solution() {\n    // Write your code here\n    \n}`,
            c: `// ${title}\n#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`,
            cpp: `// ${title}\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`,
            java: `// ${title}\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n        \n    }\n}`
        };
        return templates[lang] || "";
    };

    const languages = [
        { id: "javascript", name: "JavaScript", logo: jsLogo },
        { id: "java", name: "Java", logo: javaLogo },
        { id: "c", name: "C", logo: cLogo },
        { id: "cpp", name: "C++", logo: cppLogo }
    ];

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "Easy": return "text-green-400 border-green-500/30";
            case "Medium": return "text-yellow-400 border-yellow-500/30";
            case "Hard": return "text-red-400 border-red-500/30";
            default: return "text-gray-400 border-white/10";
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-6xl my-8 bg-[#0d0d0d] border border-white/10 rounded-xl shadow-2xl flex flex-col">

                {loading ? (
                    <div className="min-h-[400px] flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : !challengeData?.hasStarted ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                            <Code2 className="w-10 h-10 text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">100 Days of DSA</h2>
                        <p className="text-white/40 max-w-lg mb-8 text-sm">
                            Master problem solving with one challenge every day. Build consistency and earn XP.
                        </p>
                        <button
                            onClick={handleStartChallenge}
                            className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all active:scale-95"
                        >
                            Start Today's Challenge
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0 bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold text-white tracking-tight">{challengeData.challenge.title}</h2>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${getDifficultyColor(challengeData.challenge.difficulty)}`}>
                                    {challengeData.challenge.difficulty}
                                </span>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span>{challengeData.progress.currentStreak} Day Streak</span>
                                </div>
                                <div className="h-4 w-px bg-white/10" />
                                <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-white/40 hover:text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex flex-col lg:flex-row">
                            {/* Left: Problem */}
                            <div className="w-full lg:w-1/3 p-6 border-r border-white/10 bg-black/10">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Problem Statement</h3>
                                        <p className="text-sm text-white/80 leading-relaxed">{challengeData.challenge.description}</p>
                                    </div>

                                    {challengeData.challenge.examples?.map((ex, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Example {idx + 1}</h3>
                                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs font-mono">
                                                <div className="mb-1"><span className="text-white/30">Input:</span> <span className="text-blue-400">{ex.input}</span></div>
                                                <div><span className="text-white/30">Output:</span> <span className="text-green-400">{ex.output}</span></div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Constraints */}
                                    {challengeData.challenge.constraints?.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Constraints</h3>
                                            <ul className="space-y-2">
                                                {challengeData.challenge.constraints.map((constraint, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                                                        <span className="text-blue-500 mt-1">•</span>
                                                        {constraint}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Hints */}
                                    {challengeData.challenge.hints?.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Lightbulb className="w-3 h-3 text-yellow-500" />
                                                Hints
                                            </h3>
                                            <ul className="space-y-2">
                                                {challengeData.challenge.hints.map((hint, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-white/60 italic">
                                                        <span className="text-yellow-500 mt-1">💡</span>
                                                        {hint}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Workspace */}
                            <div className="flex-1 flex flex-col bg-black/5">
                                {/* Actions & Language */}
                                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => {
                                                    setLanguage(lang.id);
                                                    setCode(getCodeTemplate(lang.id, challengeData.challenge.title));
                                                }}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${language === lang.id
                                                    ? "bg-white/10 border-white/20 text-white"
                                                    : "bg-transparent border-transparent text-white/40 hover:text-white/60"
                                                    }`}
                                            >
                                                <img src={lang.logo} alt={lang.name} className="w-4 h-4" />
                                                <span className="text-xs font-medium">{lang.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {challengeData.userStatus.hasAttempted && (
                                        <div className="text-[10px] font-bold text-white/40 uppercase">
                                            Best: <span className="text-green-500">{challengeData.userStatus.bestScore}</span>/100
                                        </div>
                                    )}
                                </div>

                                {/* Editors */}
                                <div className="p-6 space-y-6">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-white/40 uppercase">
                                            <span>Source Code</span>
                                            <span className="text-blue-500/50">compulsory</span>
                                        </div>
                                        <div className="rounded-xl border border-white/10 overflow-hidden bg-black/40 min-h-[350px]">
                                            <CodeEditor
                                                value={code}
                                                language={language === "cpp" ? "cpp" : language === "java" ? "java" : "javascript"}
                                                onChange={(evn) => setCode(evn.target.value)}
                                                padding={20}
                                                style={{
                                                    fontSize: 13,
                                                    backgroundColor: "transparent",
                                                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-white/40 uppercase">
                                            <span>Logic Explanation</span>
                                            <span className="text-blue-500/50">compulsory</span>
                                        </div>
                                        <textarea
                                            value={explanation}
                                            onChange={(e) => setExplanation(e.target.value)}
                                            placeholder="Briefly describe your approach (complexity, strategy...)"
                                            className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all resize-none placeholder:text-white/10"
                                        />
                                    </div>
                                </div>

                                {/* Bottom Controls */}
                                <div className="p-6 border-t border-white/10 flex items-center gap-4 shrink-0">
                                    <button
                                        onClick={() => handleAction(true)}
                                        disabled={compiling || submitting || !code.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-lg border border-white/10 transition-all disabled:opacity-20"
                                    >
                                        {compiling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
                                        Compile & Test
                                    </button>
                                    <button
                                        onClick={() => handleAction(false)}
                                        disabled={submitting || compiling || !code.trim() || !explanation.trim()}
                                        className="flex-[1.5] flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-600/10 disabled:opacity-30"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Submit Challenge
                                    </button>
                                </div>

                                {/* Terminal Console */}
                                {result && (
                                    <div className="px-6 pb-6 shrink-0">
                                        <div className={`p-4 rounded-lg border font-mono text-xs ${result.error ? "bg-red-950/20 border-red-500/30 text-red-400" : "bg-zinc-900 border-white/10 text-white/80"
                                            }`}>
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                                                <span className="text-[10px] font-bold uppercase opacity-40">
                                                    {result.isCompile ? "Compiler Output" : "Mentor Result"}
                                                </span>
                                                {!result.error && !result.isCompile && (
                                                    <span className="text-blue-500 font-bold">SCORE: {result.evaluation.totalScore}/100</span>
                                                )}
                                            </div>
                                            <p className="leading-relaxed whitespace-pre-wrap">{result.evaluation.feedback}</p>

                                            {result.evaluation.syntaxErrors?.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                                                    <span className="text-[10px] font-bold text-red-500/50 uppercase">Errors/Critiques:</span>
                                                    {result.evaluation.syntaxErrors.map((err, i) => (
                                                        <div key={i} className="flex gap-2 text-red-400/80">
                                                            <span className="opacity-40">›</span>
                                                            <span>{err}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DsaChallengeModal;
