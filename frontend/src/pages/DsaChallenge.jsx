import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Code2, Lightbulb, CheckCircle2, Loader2, Flame, Terminal, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useAuth } from "../context/AuthContext";
import { useOutletContext } from "react-router-dom";
import Loader from "../components/Loader";
import ConfirmSubmitDialog from "../components/dsa/ConfirmSubmitDialog";
import XPEarnedPopup from "../components/dsa/XPEarnedPopup";

import jsLogo from "../assets/js.png";
import cLogo from "../assets/cprogramming.png";
import cppLogo from "../assets/cpp.png";
import javaLogo from "../assets/java.png";

const DsaChallenge = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profileData } = useOutletContext();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [challengeData, setChallengeData] = useState(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [explanation, setExplanation] = useState("");
    const [result, setResult] = useState(null);
    const [compiling, setCompiling] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showXPPopup, setShowXPPopup] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [expandedSections, setExpandedSections] = useState({ feedback: true, errors: true });

    useEffect(() => {
        if (profileData?._id) {
            fetchChallenge();
        }
    }, [profileData]);

    const fetchChallenge = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dsa/today/${profileData._id}`);
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
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/dsa/start/${profileData._id}`);
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

        // For compile, execute directly
        if (isCompile) {
            try {
                setCompiling(true);
                setResult(null);

                const response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/dsa/submit/${profileData._id}`,
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
                console.error("Compile failed:", error);
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
            }
        } else {
            // For submit, show confirmation dialog
            setShowConfirmDialog(true);
        }
    };

    const handleConfirmedSubmit = async () => {
        setShowConfirmDialog(false);

        try {
            setSubmitting(true);
            setResult(null);

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/dsa/submit/${profileData._id}`,
                {
                    challengeId: challengeData.challenge._id,
                    code,
                    explanation,
                    language,
                    isCompile: false
                }
            );

            setResult(response.data);
            setSubmissionResult(response.data);

            // Refetch challenge data to update hasAttempted status
            await fetchChallenge();

            // Show XP popup after successful submission
            if (!response.data.error) {
                setShowXPPopup(true);
            }
        } catch (error) {
            console.error("Submit failed:", error);
            setResult({
                isCompile: false,
                error: true,
                evaluation: {
                    totalScore: 0,
                    feedback: "Service unavailable. Please try again later.",
                    syntaxErrors: ["Connection failed"]
                }
            });
        } finally {
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

    if (loading) return <Loader text="Loading Challenge..." fullScreen />;

    return (
        <div className="w-full min-h-screen md:p-8 md:pt-3 animate-slideUpFade flex flex-col items-center">
            {/* Main Glass Container */}
            <div className="w-full max-w-8xl p-4 md:p-6 rounded-xl border border-white/10 backdrop-blur-2xl shadow-xl bg-black/20">

                {!challengeData?.hasStarted ? (
                    // Start Challenge View
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
                    <>
                        {/* Header Section */}
                        <div className="w-full flex flex-col gap-4 mb-4 md:mb-6 md:flex-row md:items-end md:justify-between animate-in fade-in slide-in-from-bottom-4 duration-700">

                            {/* Title Area */}
                            <div className="flex flex-row md:items-start gap-2 md:gap-6">
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors backdrop-blur-md cursor-pointer group mt-2 w-fit"
                                >
                                    <ArrowLeft className="text-white w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                                </button>

                                <div className="text-left pl-2 pt-2 md:pl-0 md:pt-0">
                                    <div className="flex items-center gap-4 mb-2">
                                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                                            {challengeData.challenge.title}
                                        </h1>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${getDifficultyColor(challengeData.challenge.difficulty)}`}>
                                            {challengeData.challenge.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-white/50 text-sm md:text-lg">Day {challengeData.currentDay} of 100</p>
                                </div>
                            </div>

                            {/* Stats Widget */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span>{challengeData.progress.currentStreak} Day Streak</span>
                                </div>
                                {challengeData.userStatus.hasAttempted && (
                                    <div className="text-[10px] font-bold text-white/40 uppercase">
                                        Best: <span className="text-green-500">{challengeData.userStatus.bestScore}</span>/100
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Area - Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                            {/* Left: Problem Statement */}
                            <div className="lg:col-span-1 p-4 border border-white/10 rounded-xl bg-black/40 backdrop-blur-xl">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Problem Statement</h3>
                                        <p className="text-sm text-white/80 leading-relaxed">{challengeData.challenge.description}</p>
                                    </div>

                                    {challengeData.challenge.examples?.map((ex, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Example {idx + 1}</h3>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-lg text-xs font-mono">
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

                            {/* Right: Code Editor & Workspace */}
                            <div className="lg:col-span-2 flex flex-col gap-4">

                                {/* Language Selector */}
                                <div className="px-4 py-3 border border-white/10 rounded-xl bg-black/40 backdrop-blur-xl flex items-center justify-between">
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
                                </div>

                                {/* Code Editor */}
                                <div className="flex flex-col gap-3 p-4 border border-white/10 rounded-xl bg-black/40 backdrop-blur-xl">
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

                                {/* Logic Explanation */}
                                <div className="flex flex-col gap-3 p-4 border border-white/10 rounded-xl bg-black/40 backdrop-blur-xl">
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

                                {/* Action Buttons */}
                                <div className="flex items-center gap-4">
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
                                    <div className="p-4 border border-white/10 rounded-xl bg-black/40 backdrop-blur-xl">
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

                                            {/* For compile mode with no errors, show success message and output */}
                                            {result.isCompile && result.evaluation.syntaxErrors?.length === 0 ? (
                                                <div className="space-y-3">
                                                    <p className="leading-relaxed text-green-400 flex items-center gap-2">
                                                        {result.evaluation.feedback}
                                                    </p>
                                                    {result.evaluation.output && (
                                                        <div className="pt-3 border-t border-white/10">
                                                            <span className="text-[10px] font-bold text-blue-400/50 uppercase block mb-2">Output:</span>
                                                            <div className="bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-sm text-white/90">
                                                                {result.evaluation.output}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : result.isCompile ? (
                                                <>
                                                    {/* Show errors if they exist */}
                                                    {result.evaluation.syntaxErrors?.length > 0 && (
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-bold text-red-500/50 uppercase">Errors:</span>
                                                            {result.evaluation.syntaxErrors.map((err, i) => (
                                                                <div key={i} className="flex gap-2 text-red-400/80">
                                                                    <span className="opacity-40">›</span>
                                                                    <span>{err}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {/* Submission Result - Parse and structure the feedback */}
                                                    {(() => {
                                                        const feedback = result.evaluation.feedback || "";
                                                        const lines = feedback.split('\n').filter(line => line.trim());

                                                        // Parse sections
                                                        const sections = [];
                                                        let currentSection = null;

                                                        lines.forEach(line => {
                                                            const trimmed = line.trim();

                                                            // Check for section headers (###, ##, or numbered sections)
                                                            if (trimmed.startsWith('###') || trimmed.startsWith('##') || /^\d+\./.test(trimmed)) {
                                                                if (currentSection) sections.push(currentSection);
                                                                currentSection = {
                                                                    title: trimmed.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '').replace(/\*\*/g, ''),
                                                                    content: []
                                                                };
                                                            } else if (currentSection) {
                                                                // Clean up markdown formatting
                                                                const cleaned = trimmed
                                                                    .replace(/\*\*/g, '') // Remove bold
                                                                    .replace(/\*/g, '')   // Remove italics
                                                                    .replace(/`/g, '')    // Remove code backticks
                                                                    .replace(/^[-•]\s*/, '• '); // Normalize bullets

                                                                if (cleaned) currentSection.content.push(cleaned);
                                                            }
                                                        });

                                                        if (currentSection) sections.push(currentSection);

                                                        return (
                                                            <div className="space-y-4">
                                                                {sections.map((section, idx) => (
                                                                    <div key={idx} className={idx > 0 ? "pt-4 border-t border-white/5" : ""}>
                                                                        <h4 className="text-sm font-bold text-white/90 mb-2">{section.title}</h4>
                                                                        <div className="space-y-1.5 text-white/70 leading-relaxed">
                                                                            {section.content.map((line, i) => (
                                                                                <p key={i} className={line.startsWith('•') ? "pl-3" : ""}>
                                                                                    {line}
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                {/* Show errors/critiques if they exist */}
                                                                {result.evaluation.syntaxErrors?.length > 0 && (
                                                                    <div className="pt-4 border-t border-white/5 space-y-1">
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
                                                        );
                                                    })()}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Confirmation Dialog */}
            <ConfirmSubmitDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirmedSubmit}
                xpToEarn={challengeData?.challenge?.maxXP || 100}
                isFirstAttempt={!challengeData?.userStatus?.hasAttempted}
                streak={challengeData?.progress?.currentStreak || 0}
            />

            {/* XP Earned Popup */}
            <XPEarnedPopup
                isOpen={showXPPopup}
                onClose={() => setShowXPPopup(false)}
                xpEarned={submissionResult?.xpAwarded || 0}
                score={submissionResult?.evaluation?.totalScore || 0}
                difficulty={challengeData?.challenge?.difficulty || "Medium"}
                streak={challengeData?.progress?.currentStreak || 0}
                isFirstAttempt={submissionResult?.isFirstAttempt || false}
            />
        </div>
    );
};

export default DsaChallenge;
