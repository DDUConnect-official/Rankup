import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, Volume2, VolumeX } from "lucide-react";

const ProfileSetupIntro = ({ onContinue }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(new Audio());
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const introText = "Before you dive into the world of gamified learning, let's set up your profile. Choose your persona, pick your vibe, and get ready to level up your skills!";

    const fadeOutInterval = useRef(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        // Disable body scroll
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            if (isMounted.current) setIsVisible(true);
        }, 100);

        return () => {
            isMounted.current = false;
            document.body.style.overflow = "auto";
            // Cleanup audio and intervals on unmount
            if (fadeOutInterval.current) clearInterval(fadeOutInterval.current);
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        };
    }, []);

    const [showUnmuteHint, setShowUnmuteHint] = useState(false);

    // Audio Playback Trigger
    useEffect(() => {
        const fetchAndPlayAudio = async () => {
            try {
                // If we already have a src, just play (handle re-visible case if any)
                if (audioRef.current.src) {
                     if (!isMuted && audioRef.current.paused) {
                        attemptPlay();
                     }
                     return;
                }

                const response = await fetch(`${backendUrl}/api/student/synthesize`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: introText,
                        voiceId: "en-US-natalie",
                    }),
                });
                
                if (!isMounted.current) return;

                if (response.ok) {
                    const data = await response.json();
                    if (data.audioUrl && isMounted.current) {
                        audioRef.current.src = data.audioUrl;
                        if (!isMuted) {
                            attemptPlay();
                        }
                    }
                }
            } catch (err) {
                console.error("Audio fetch failed", err);
            }
        };

        fetchAndPlayAudio();
    }, []);

    const attemptPlay = () => {
        audioRef.current.play().catch(e => {
            console.log("Auto-play blocked, showing hint:", e);
            setShowUnmuteHint(true);
        });
    };

    // Handle Mute Toggle
    useEffect(() => {
        audioRef.current.muted = isMuted;
        if (!isMuted && audioRef.current.paused && audioRef.current.src && isVisible) {
            attemptPlay();
        }
        if (!isMuted) {
            setShowUnmuteHint(false);
        }
    }, [isMuted, isVisible]);

    // Handle Page Visibility (Pause on Tab Switch/Minimize)
    useEffect(() => {
        const handleVisibilityChange = () => {
             if (document.hidden) {
                 audioRef.current.pause();
             } else {
                 // Optional: Resume if it was supposed to be playing and not muted?
                 // For now, let's keep it simple: strict pause on hide. 
                 // If we want to auto-resume, we need to track 'wasPlaying'.
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


    const handleContinue = () => {
        setIsVisible(false);
        
        // Smooth fade out
        fadeOutInterval.current = setInterval(() => {
            if (audioRef.current.volume > 0.1) {
                audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.1);
            } else {
                if (fadeOutInterval.current) clearInterval(fadeOutInterval.current);
                audioRef.current.pause();
            }
        }, 50);
        
        setTimeout(() => {
            if (fadeOutInterval.current) clearInterval(fadeOutInterval.current);
            onContinue();
        }, 300);
    };

    // Sparkle colors - purple/pink theme
    const sparkleColors = ["bg-purple-400", "bg-pink-400", "bg-fuchsia-300", "bg-violet-400"];

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
                className={`relative z-10000 max-w-2xl w-[90%] md:w-[600px] transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                {/* Simple Glassmorphism Card */}
                <div className="relative p-8 md:p-12 rounded-3xl backdrop-blur-2xl border-2 border-white/20 shadow-2xl text-center">
                    
                    {/* Mute Button */}
                    <button 
                        onClick={() => {
                            setIsMuted(!isMuted);
                            setShowUnmuteHint(false);
                        }} 
                        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-20 p-2 hover:bg-white/10 rounded-full group"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        
                        {/* Unmute Hint Tooltip */}
                        {showUnmuteHint && (
                            <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-white text-black text-xs font-bold rounded-lg whitespace-nowrap animate-bounce shadow-lg">
                                Tap to unmute 🔊
                                <div className="absolute -top-1 right-3 w-2 h-2 bg-white rotate-45"></div>
                            </div>
                        )}
                    </button>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight text-white">
                        Welcome to RankUp! 🎯
                    </h1>

                    {/* Description */}
                    <p className="text-base md:text-lg text-white/90 font-medium mb-8 leading-relaxed max-w-lg mx-auto">
                        {introText}
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
                className={`fixed bottom-0 right-0 z-10002 w-56 h-72 md:w-96 md:h-112 lg:w-100 lg:h-100 pointer-events-none transition-all duration-700 ${isVisible
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
