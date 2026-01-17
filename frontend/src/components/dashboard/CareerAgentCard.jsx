import React, { useState, useEffect } from "react";
import { Bot, ChevronRight } from "lucide-react";

const CareerAgentCard = ({ careerModule }) => {
    const [currentCareerMsg, setCurrentCareerMsg] = useState(0);

    const careerMessages = [
        "Tracking your Math, Science, and Coding skills to guide your future.",
        "Not sure what to learn next? I’ll help you decide.",
        "Turning your learning progress into career opportunities.",
        "AI-powered career guidance based on your strengths.",
        "From today’s learning to tomorrow’s career."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentCareerMsg((prev) => (prev + 1) % careerMessages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className={`group relative p-1 rounded-tl-2xl rounded-br-2xl bg-black/20 border border-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:scale-[1.01] md:col-span-2`}
        >
            {/* Corner Shine Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none overflow-hidden z-0 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-purple-500 via-pink-500 to-transparent animate-pulse"></div>
                <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-purple-500 via-pink-500 to-transparent animate-pulse"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none overflow-hidden z-0 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-cyan-500 to-transparent animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[2px] h-full bg-gradient-to-t from-blue-500 via-cyan-500 to-transparent animate-pulse"></div>
            </div>

            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

            {/* AI Sparkles (Bottom Rise - Multi-color) */}
            <div className="absolute bottom-0 left-0 w-full h-25 overflow-hidden pointer-events-none z-0">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className={`animate-sparkle rounded-full absolute bottom-0 ${["bg-blue-400", "bg-purple-400", "bg-pink-400", "bg-cyan-400", "bg-emerald-300", "bg-indigo-400"][Math.floor(Math.random() * 6)]}`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3 + 4}px`,
                            height: `${Math.random() * 3 + 4}px`,
                            animationDuration: `${Math.random() * 5 + 8}s`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: Math.random() * 0.5 + 0.3,
                        }}
                    />
                ))}
            </div>

            <div className="relative p-4 md:p-8 flex flex-col md:flex-row items-center gap-6 z-10">
                <div className="flex-shrink-0 px-1 pt-1 pb-0 rounded-2xl border border-white/10 transition-transform duration-300">
                    {careerModule.icon}
                </div>

                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-rose-300 transition-all">
                        {careerModule.title}
                    </h3>
                    <p key={currentCareerMsg} className="text-white/60 text-lg animate-slideUpFade">
                        {careerMessages[currentCareerMsg]}
                    </p>
                </div>

                {/* Glassy Shiny Button */}
                <button className="relative overflow-hidden flex-shrink-0 cursor-pointer px-8 py-4 rounded-xl border border-white/10 bg-black/70 backdrop-blur-sm  text-white font-bold flex items-center justify-center gap-2 group/btn transition-all active:scale-[0.98]">
                    <span className="relative z-10 flex items-center gap-2">
                        Launch Agent
                        <Bot className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                    </span>
                    <div className="shine-overlay shine-effect"></div>
                </button>
            </div>
        </div>
    );
};

export default CareerAgentCard;
