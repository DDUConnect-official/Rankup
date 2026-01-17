import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

const ProfileSetupIntro = ({ onContinue }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Disable body scroll
        document.body.style.overflow = "hidden";
        setTimeout(() => setIsVisible(true), 100);

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleContinue = () => {
        setIsVisible(false);
        setTimeout(() => onContinue(), 300);
    };

    // Sparkle colors - purple/pink theme
    const sparkleColors = ["bg-purple-400", "bg-pink-400", "bg-fuchsia-300", "bg-violet-400"];

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
        >
            {/* Blurred Background */}
            <div className="absolute inset-0 backdrop-blur-xl"></div>

            {/* Full Screen Sparkles Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[9998]">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className={`animate-sparkle rounded-full absolute bottom-0 ${sparkleColors[Math.floor(Math.random() * 4)]}`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 4 + 3}px`,
                            height: `${Math.random() * 4 + 3}px`,
                            animationDuration: `${Math.random() * 6 + 10}s`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: Math.random() * 0.6 + 0.3,
                        }}
                    />
                ))}
            </div>

            {/* Content Card - Centered */}
            <div
                className={`relative z-[10000] max-w-2xl w-[90%] md:w-[600px] transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                {/* Simple Glassmorphism Card */}
                <div className="relative p-8 md:p-12 rounded-3xl backdrop-blur-2xl border-2 border-white/20 shadow-2xl text-center">
                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight text-white">
                        Welcome to RankUp! 🎯
                    </h1>

                    {/* Description */}
                    <p className="text-base md:text-lg text-white/90 font-medium mb-8 leading-relaxed max-w-lg mx-auto">
                        Before you dive into the world of gamified learning, let's set up your profile.
                        Choose your persona, pick your vibe, and get ready to level up your skills!
                    </p>

                    {/* Continue Button */}
                    <button
                        onClick={handleContinue}
                        className="relative overflow-hidden inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 backdrop-blur-2xl text-white font-bold uppercase text-base tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] group/btn cursor-pointer"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Let's Get Started
                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                        <div className="shine-overlay shine-effect"></div>
                    </button>
                </div>
            </div>

            {/* Avatar - Bottom Right Corner */}
            <div
                className={`fixed bottom-0 right-0 z-[10002] w-56 h-72 md:w-96 md:h-[28rem] lg:w-[25rem] lg:h-[25rem] pointer-events-none transition-all duration-700 ${isVisible
                    ? "opacity-100 translate-x-0 translate-y-0"
                    : "opacity-0 translate-x-20 translate-y-20"
                    }`}
                style={{
                    animation: isVisible ? "gentleFloat 3s ease-in-out infinite" : "none",
                }}
            >
                <img
                    src="https://res.cloudinary.com/dksb0nx42/image/upload/v1768674348/welcome_Slide1-removebg-preview_vctv9n.png"
                    alt="Welcome avatar"
                    className="w-full h-full object-contain object-bottom drop-shadow-2xl"
                />
            </div>

            {/* Floating Animation Keyframes */}
            <style>{`
                @keyframes gentleFloat {
                    0%, 100% {
                        transform: translateY(10px);
                    }
                    50% {
                        transform: translateY(0px);
                    }
                }
            `}</style>
        </div>
    );
};

export default ProfileSetupIntro;
