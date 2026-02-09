import React from "react";
import { Code2, Flame, Trophy } from "lucide-react";

const DsaChallengeWidget = ({ progress, onClick }) => {
    const { hasStarted, currentDay, currentStreak, totalCompleted } = progress || {};

    return (
        <div
            onClick={onClick}
            className="relative group cursor-pointer w-full md:w-auto rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
        >
            {/* 1. The Shiny Border Layer (Masked, behind content) */}
            <div className="absolute inset-0 rounded-2xl z-0 mask-border pointer-events-none">
                <div className="absolute -inset-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_45%,rgba(34,197,94,0.6)_50%,transparent_55%,transparent_100%)] animate-[spin_6s_linear_infinite]" />
            </div>

            {/* 2. The Transparent Content Layer */}
            <div className="relative z-10 h-full w-full rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center gap-6 p-4">

                {!hasStarted ? (
                    // Not Started State
                    <>
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30">
                            <Code2 className="w-7 h-7 text-green-400" />
                        </div>
                        <div className="flex flex-col justify-center border-l border-white/10 pl-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">100 Days DSA</p>
                            <p className="text-lg font-bold text-white">Start Journey</p>
                        </div>
                    </>
                ) : (
                    // Active State
                    <>
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 relative">
                                <Code2 className="w-7 h-7 text-green-400" />
                                {currentStreak > 0 && (
                                    <div className="absolute -top-1 -right-1 flex items-center gap-0.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        <Flame className="w-3 h-3" />
                                        {currentStreak}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col justify-center border-l border-white/10 pl-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Day {currentDay}/100</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-white">{totalCompleted || 0}</p>
                                <Trophy className="w-4 h-4 text-yellow-500" />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DsaChallengeWidget;
