import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { welcomeSlides } from "../data/welcomeGuideData";
import { useAuth } from "../context/AuthContext";

const WelcomeGuide = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const { user } = useAuth();

    const slide = welcomeSlides[currentSlide];
    const isLastSlide = currentSlide === welcomeSlides.length - 1;

    // Trigger entrance animation and disable scroll
    useEffect(() => {
        // Disable body scroll
        document.body.style.overflow = "hidden";

        setTimeout(() => setIsVisible(true), 100);

        // Re-enable scroll on unmount
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleNext = () => {
        if (currentSlide < welcomeSlides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const handlePrevious = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleComplete = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/users/welcome-guide-complete/${user.uid}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                setIsVisible(false);
                setTimeout(() => onComplete(), 300);
            }
        } catch (error) {
            console.error("Error completing welcome guide:", error);
            setIsVisible(false);
            setTimeout(() => onComplete(), 300);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    // Sparkle colors based on slide
    const sparkleColorPalettes = {
        1: ["bg-blue-400", "bg-cyan-300", "bg-indigo-400", "bg-purple-300"],
        2: ["bg-blue-400", "bg-cyan-300", "bg-indigo-400", "bg-purple-300"],
        3: ["bg-emerald-400", "bg-green-300", "bg-teal-400", "bg-cyan-300"],
        4: ["bg-orange-400", "bg-amber-300", "bg-yellow-400", "bg-red-300"],
        5: ["bg-purple-400", "bg-pink-400", "bg-fuchsia-300", "bg-violet-400"],
    };

    const currentSparkles = sparkleColorPalettes[slide.id] || sparkleColorPalettes[1];

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
                        className={`animate-sparkle rounded-full absolute bottom-0 ${currentSparkles[Math.floor(Math.random() * 4)]}`}
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

            {/* Speech Bubble - Centered with Simple Glassmorphism */}
            <div
                className={`relative z-[10000] max-w-2xl w-[90%] md:w-[600px] transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                {/* Simple Glassmorphism Card */}
                <div className="relative p-6 md:p-10 rounded-3xl backdrop-blur-2xl border-2 border-white/20 shadow-2xl">
                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 text-left leading-tight text-white">
                        {slide.title}
                    </h2>

                    {/* Description */}
                    <p className="text-base md:text-lg text-white/90 font-medium mb-6 text-left leading-relaxed">
                        {slide.content}
                    </p>

                    {/* Progress Dots */}
                    <div className="flex gap-2.5 mb-6">
                        {welcomeSlides.map((_, index) => (
                            <div
                                key={index}
                                className={`h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                    ? "w-9 bg-white"
                                    : "w-3 bg-white/30"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 flex-wrap">
                        {/* Previous Button */}
                        {currentSlide > 0 && (
                            <button
                                onClick={handlePrevious}
                                className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 backdrop-blur-2xl text-white font-bold uppercase text-sm tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] group/btn cursor-pointer"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <ChevronLeft className="w-5 h-5" />
                                    Back
                                </span>
                                <div className="shine-overlay shine-effect"></div>
                            </button>
                        )}

                        {/* Next / Start Journey Button */}
                        {isLastSlide ? (
                            <button
                                onClick={handleComplete}
                                className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-xl  border border-white/10 text-white font-extrabold uppercase text-base tracking-wide transition-all duration-300 shadow-lg active:scale-[0.98] cursor-pointer hover:-translate-y-0.5"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start My Journey 🎯
                                </span>
                                <div className="shine-overlay shine-effect"></div>
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 backdrop-blur-2xl text-white font-bold uppercase text-sm tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] group/btn cursor-pointer"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Next
                                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </span>
                                <div className="shine-overlay shine-effect"></div>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Avatar - Bottom Right Corner (Absolutely Stuck to Bottom) */}
            <div
                className={`fixed bottom-0 right-0 md:right-25 z-[10002] w-56 h-72 md:w-96 md:h-[28rem] lg:w-[25rem] lg:h-[25rem] pointer-events-none transition-all duration-700 ${isVisible
                    ? "opacity-100 translate-x-0 translate-y-0"
                    : "opacity-0 translate-x-20 translate-y-20"
                    }`}
                style={{
                    animation: isVisible ? "gentleFloat 3s ease-in-out infinite" : "none",
                }}
            >
                <img
                    src={slide.avatar}
                    alt={`Slide ${slide.id} guide`}
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

export default WelcomeGuide;
