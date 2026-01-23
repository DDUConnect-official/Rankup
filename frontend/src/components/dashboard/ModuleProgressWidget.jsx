import React from "react";
import { Trophy, Target, Zap } from "lucide-react";

const ModuleProgressWidget = ({ totalLevels, levelsCompleted = 0, totalXp = 0 }) => {
    return (
        <div className="relative group w-full md:w-auto rounded-2xl overflow-hidden transition-all hover:scale-[1.01]">

            {/* 1. The Shiny Border Layer (Masked, behind content) */}
            <div className="absolute inset-0 rounded-2xl z-0 mask-border pointer-events-none">
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_45%,rgba(59,130,246,0.6)_50%,transparent_55%,transparent_100%)] animate-[spin_6s_linear_infinite]" />
            </div>

            {/* 2. The Transparent Content Layer */}
            <div className="relative z-10 h-full w-full rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center gap-6 p-4">

                {/* Icon Cluster */}
                <div className="flex items-center gap-4 border-r border-white/10 pr-6">
                    <div className="relative w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Trophy className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                </div>

                {/* Stats Text */}
                <div className="flex flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Mission Status</p>
                    <div className="flex flex-col gap-0 md:flex-row md:items-center md:gap-4">
                        <div className="flex items-center gap-2">
                             <Target className="w-4 h-4 text-emerald-400" />
                             <span className="text-white font-bold">{levelsCompleted}/{totalLevels} Levels</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ModuleProgressWidget;
