import React from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LearningModuleCard = ({ module }) => {
    const navigate = useNavigate();

    // Sparkle Color Palettes
    const sparkleColors = {
        maths: ["bg-amber-400", "bg-yellow-200", "bg-red-400", "bg-orange-300"],
        science: ["bg-emerald-400", "bg-cyan-200", "bg-teal-400", "bg-green-300"],
        coding: ["bg-orange-400", "bg-amber-200", "bg-yellow-400", "bg-orange-300"],
    };

    return (
        <div
            onClick={() => navigate(`/levels/${module.dbId}`)}
            className={`group relative p-1 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
        >
            {/* Hover Gradient Glow */}
            <div className={`absolute inset-0 transition-opacity duration-500`} />

            <div className="relative p-4 md:p-6 flex flex-col h-full z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
                        {module.icon}
                    </div>
                    <div className="px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-white/50 font-bold tracking-wider">
                        Lvl 1
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                    {module.title}
                </h3>
                <p className="text-white/60 mb-6 grow">
                    {module.description}
                </p>

                {/* Themed Sparkles Effect */}
                {sparkleColors[module.id] && (
                    <div className="absolute bottom-0 left-0 w-full h-60 overflow-hidden pointer-events-none z-0">
                        {[...Array(25)].map((_, i) => (
                            <div
                                key={i}
                                className={`animate-sparkle rounded-full absolute bottom-0 ${sparkleColors[module.id][Math.floor(Math.random() * 4)]}`}
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    width: `${Math.random() * 3 + 3}px`,
                                    height: `${Math.random() * 3 + 3}px`,
                                    animationDuration: `${Math.random() * 5 + 8}s`,
                                    animationDelay: `${Math.random() * 5}s`,
                                    opacity: Math.random() * 0.5 + 0.3,
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Glassy Shiny Button */}
                <button className="relative overflow-hidden cursor-pointer w-full py-4 rounded-xl border border-white/10 backdrop-blur-2xl bg-black/80 shadow-xl text-white font-bold flex items-center justify-center gap-2 group/btn transition-all active:scale-[0.98]">
                    <span className="relative z-10 flex items-center gap-2">
                        Start Learning
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    <div className="shine-overlay shine-effect -translate-x-full"></div>
                </button>
            </div>
        </div>
    );
};

export default LearningModuleCard;
