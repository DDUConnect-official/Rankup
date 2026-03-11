import React, { useEffect, useState } from "react";
import { X, Zap, Trophy, Flame, TrendingUp, Target } from "lucide-react";

const XPEarnedPopup = ({ isOpen, onClose, xpEarned, score, difficulty, streak, isFirstAttempt }) => {
    const [displayXP, setDisplayXP] = useState(0);

    // Animate XP counter
    useEffect(() => {
        if (isOpen && xpEarned > 0) {
            let current = 0;
            const increment = Math.ceil(xpEarned / 30);
            const timer = setInterval(() => {
                current += increment;
                if (current >= xpEarned) {
                    setDisplayXP(xpEarned);
                    clearInterval(timer);
                } else {
                    setDisplayXP(current);
                }
            }, 30);
            return () => clearInterval(timer);
        } else {
            setDisplayXP(0);
        }
    }, [isOpen, xpEarned]);

    // Get motivating message based on score
    const getMotivatingMessage = () => {
        if (!isFirstAttempt) {
            return {
                title: "Practice Makes Perfect!",
                subtitle: "Keep going! Every attempt makes you better! 🎯",
                icon: Target,
                color: "text-purple-400"
            };
        }

        if (score >= 90) {
            return {
                title: "Outstanding!",
                subtitle: "You're crushing it! 🔥",
                icon: Trophy,
                color: "text-yellow-400"
            };
        } else if (score >= 70) {
            return {
                title: "Great Work!",
                subtitle: "Keep the momentum going! 💪",
                icon: TrendingUp,
                color: "text-green-400"
            };
        } else if (score >= 50) {
            return {
                title: "Good Effort!",
                subtitle: "You're improving! 🌟",
                icon: Zap,
                color: "text-blue-400"
            };
        } else {
            return {
                title: "Keep Practicing!",
                subtitle: "Every attempt makes you better! 💡",
                icon: Target,
                color: "text-orange-400"
            };
        }
    };

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case "Easy": return "text-green-400";
            case "Medium": return "text-yellow-400";
            case "Hard": return "text-red-400";
            default: return "text-white";
        }
    };

    if (!isOpen) return null;

    const message = getMotivatingMessage();
    const Icon = message.icon;

    return (
        <div className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-linear-to-br from-[#0d0d0d] to-[#1a1a1a] border border-white/20 rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors z-10"
                >
                    <X className="w-5 h-5 text-white/60 hover:text-white" />
                </button>

                {/* Content */}
                <div className="p-8 space-y-6 text-center">
                    {/* Icon */}
                    <div className="flex items-center justify-center">
                        <div className={`w-20 h-20 rounded-full bg-linear-to-br ${isFirstAttempt ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' : 'from-purple-500/20 to-blue-500/20 border-purple-500/30'} border-2 flex items-center justify-center animate-in zoom-in duration-500`}>
                            <Icon className={`w-10 h-10 ${message.color}`} />
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <h3 className={`text-2xl font-bold ${message.color}`}>
                            {message.title}
                        </h3>
                        <p className="text-white/60 text-sm">
                            {message.subtitle}
                        </p>
                    </div>

                    {/* XP Display */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                        {isFirstAttempt ? (
                            <>
                                <div className="flex items-center justify-center gap-2">
                                    <Zap className="w-6 h-6 text-yellow-400" />
                                    <span className="text-5xl font-bold text-yellow-400 tabular-nums">
                                        +{displayXP}
                                    </span>
                                    <span className="text-xl text-white/40 font-medium">XP</span>
                                </div>
                                <div className="text-xs text-white/40">
                                    XP Earned from First Submission
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-center gap-2">
                                    <Target className="w-6 h-6 text-purple-400" />
                                    <span className="text-3xl font-bold text-purple-400">
                                        Practice Mode
                                    </span>
                                </div>
                                <div className="text-xs text-white/40">
                                    No XP earned • Keep practicing to improve!
                                </div>
                            </>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                            <div className="text-xs text-white/40 mb-1">Score</div>
                            <div className="text-2xl font-bold text-white">{score}<span className="text-sm text-white/40">/100</span></div>
                        </div>
                        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                            <div className="text-xs text-white/40 mb-1">Difficulty</div>
                            <div className={`text-lg font-bold ${getDifficultyColor(difficulty)}`}>{difficulty}</div>
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-white/60">Current Streak:</span>
                        <span className="text-orange-400 font-bold">{streak} {streak === 1 ? 'Day' : 'Days'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default XPEarnedPopup;
