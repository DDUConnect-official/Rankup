import React, { useState, useEffect, useRef } from "react";
import { X, ChevronRight, ChevronLeft, Volume2, VolumeX } from "lucide-react";
import { welcomeSlides } from "../data/welcomeGuideData";
import { useAuth } from "../context/AuthContext";

const WelcomeGuide = ({ onComplete }) => {
    // State & Refs
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const { user } = useAuth();
    const [isMuted, setIsMuted] = useState(false);
    
    // Refs
    const audioRef = useRef(new Audio());
    const audioCache = useRef({});
    const isMounted = useRef(true);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
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



    // Helper to fetch audio URL (with caching)
    const fetchAudioUrl = async (index) => {
        if (audioCache.current[index]) {
            return audioCache.current[index];
        }

        const slideData = welcomeSlides[index];
        if (!slideData) return null;

        try {
            const response = await fetch(`${backendUrl}/api/student/synthesize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: slideData.content,
                    voiceId: "en-US-natalie",
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.audioUrl) {
                    audioCache.current[index] = data.audioUrl;
                    return data.audioUrl;
                }
            }
        } catch (error) {
            console.error("Error generating voice:", error);
        }
        return null;
    };

    // Audio Playback & Pre-fetching
    useEffect(() => {
        if (!isVisible) return;

        // Stop previous audio
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        const playCurrentAndPreload = async () => {
            if (!isMounted.current) return;
            setIsLoadingAudio(true);
            
            // 1. Get/Fetch Current Slide Audio
            const url = await fetchAudioUrl(currentSlide);
            
            if (url && isMounted.current) {
                audioRef.current.src = url;
                if (!isMuted) {
                    audioRef.current.play().catch(e => console.log("Audio play failed:", e));
                }
            }
            if (isMounted.current) setIsLoadingAudio(false);

            // 2. Pre-fetch Next Slide Audio (Background)
            if (currentSlide < welcomeSlides.length - 1 && isMounted.current) {
                fetchAudioUrl(currentSlide + 1);
            }
        };

        playCurrentAndPreload();

        return () => {
            audioRef.current.pause();
        };
    }, [currentSlide, isVisible, isMuted]);

    // Handle isMounted
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Update muted state immediately
    useEffect(() => {
        audioRef.current.muted = isMuted;
        if (!isMuted && audioRef.current.paused && audioRef.current.src) {
            audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
    }, [isMuted]);

    // Handle Page Visibility (Pause on Tab Switch/Minimize)
    useEffect(() => {
        const handleVisibilityChange = () => {
             if (document.hidden) {
                 audioRef.current.pause();
             } else {
                 // Resume if valid state
                 if (!isMuted && isVisible && isMounted.current && audioRef.current.paused && audioRef.current.currentTime > 0 && !audioRef.current.ended) {
                     audioRef.current.play().catch(e => console.log("Resume failed", e));
                 }
             }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [isMuted, isVisible]);

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
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        try {
            const response = await fetch(
                `${backendUrl}/api/users/welcome-guide-complete/${user.uid}`,
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
            className={`fixed inset-0 z-9999 flex items-center justify-center transition-opacity duration-300 ${isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
        >
            {/* Blurred Background */}
            <div className="absolute inset-0 backdrop-blur-xl"></div>

            {/* Full Screen Sparkles Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-9998">
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
                className={`relative z-10000 max-w-2xl w-[90%] md:w-[600px] transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                {/* Simple Glassmorphism Card */}
                <div className="relative p-6 md:p-10 rounded-3xl backdrop-blur-2xl border-2 border-white/20 shadow-2xl">
                    <button 
                        onClick={() => setIsMuted(!isMuted)} 
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-20"
                    >
                        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
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
                className={`fixed bottom-0 right-0 md:right-25 z-10002 w-56 h-72 md:w-96 md:h-112 lg:w-100 lg:h-100 pointer-events-none transition-all duration-700 ${isVisible
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
