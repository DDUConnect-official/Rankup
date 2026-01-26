
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Loader2, StopCircle } from 'lucide-react';
import axios from 'axios';

const VoiceAssistant = ({ context }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [status, setStatus] = useState('idle'); // idle, listening, thinking, speaking, error
    const [isOpen, setIsOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const recognitionRef = useRef(null);
    const audioRef = useRef(new Audio());
    const silenceTimerRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Stop after one sentence/phrase
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setStatus('listening');
                setTranscript('');
            };

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const result = event.results[current][0].transcript;
                setTranscript(result);
                handleAiProcess(result);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                setStatus('idle');
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                // Status will continue to 'thinking' if result was caught, else 'idle'
                if (status === 'listening') setStatus('idle');
            };
        } else {
            console.warn("Speech Recognition not supported in this browser.");
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const toggleListening = () => {
        if (!isOpen) setIsOpen(true);

        if (isListening) {
            recognitionRef.current?.stop();
        } else if (status === 'speaking') {
            // STOP Logic
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setStatus('idle');
            setAiResponse(''); // Optional: clear text or keep it
        } else {
            // Stop any playing audio
            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            setErrorMessage(''); // Clear errors

            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    console.error("Recognition start error:", e);
                    setStatus('error');
                    setErrorMessage("Microphone access failed.");
                }
            } else {
                alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
            }
        }
    };

    const handleAiProcess = async (userText) => {
        setStatus('thinking');

        try {
            // 1. Get AI Text Response
            // Format context if it exists (handles both old object array and new string array)
            const contextText = context ? context.map(item => typeof item === 'string' ? item : item.content).join("\n") : "";

            const chatRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`, {
                message: userText,
                context: contextText
            });
            const textResponse = chatRes.data.response;
            setAiResponse(textResponse);

            // 2. Synthesize to Voice (Murf)
            const audioRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/student/synthesize`, {
                text: textResponse,
                voiceId: 'en-US-marcus'
            });

            if (audioRes.data.audioUrl) {
                playAudio(audioRes.data.audioUrl);
            } else {
                setStatus('idle');
            }

        } catch (err) {
            console.error("AI Assistant Error:", err);
            setStatus('error');
            setErrorMessage("I'm having trouble connecting. Please try again.");
            setTimeout(() => {
                setStatus('idle');
                setErrorMessage('');
            }, 4000);
        }
    };

    const playAudio = (url) => {
        setStatus('speaking');
        audioRef.current.src = url;
        audioRef.current.play()
            .then(() => {
                audioRef.current.onended = () => {
                    setStatus('idle');
                };
            })
            .catch(err => {
                console.error("Playback error", err);
                setStatus('idle');
            });
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 group z-50 transition-transform hover:scale-105"
            >
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 group-hover:opacity-40 animate-pulse blur-xl" />

                {/* Main Button */}
                <div className="relative w-full h-full bg-[#0a0a0a] border-2 border-blue-500/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] group-hover:border-blue-400 transition-all overflow-hidden">

                    {/* Inner sheen effect */}
                    <div className="absolute inset-0 bg-linear-to-tr from-blue-600/20 to-purple-600/20" />

                    {/* Icon */}
                    <div className="relative z-10 text-blue-400 group-hover:text-blue-100 transition-colors">
                        <Mic size={28} />
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 z-50 animate-slideUpFade">
            {/* HUD Container */}
            <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.2)] overflow-hidden relative">

                {/* Decorative Tech Lines */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 via-cyan-400 to-blue-600" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl" />

                {/* Header */}
                <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${status === 'listening' ? 'bg-red-500 text-red-500 animate-pulse' :
                                status === 'speaking' ? 'bg-green-500 text-green-500 animate-pulse' :
                                    status === 'thinking' ? 'bg-yellow-500 text-yellow-500 animate-bounce' :
                                        'bg-blue-500 text-blue-500'
                            }`} />
                        <span className="font-bold text-blue-100 tracking-wider text-sm uppercase">AI Companion</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 min-h-[180px] flex flex-col justify-between relative">

                    <div className="space-y-4">
                        {status === 'idle' && !transcript && (
                            <div className="text-center py-4">
                                <p className="text-blue-200/60 text-sm mb-2">Systems Online</p>
                                <p className="text-white/80 font-medium">"Ask me to explain this level!"</p>
                            </div>
                        )}

                        {transcript && (
                            <div className="flex justify-end">
                                <div className="bg-blue-600/20 border border-blue-500/30 rounded-t-2xl rounded-bl-2xl px-4 py-2 max-w-[85%]">
                                    <p className="text-xs text-blue-400 mb-0.5 font-bold tracking-wider">YOU</p>
                                    <p className="text-white text-sm">{transcript}</p>
                                </div>
                            </div>
                        )}

                        {aiResponse && status !== 'thinking' && (
                            <div className="flex justify-start">
                                <div className="bg-purple-600/10 border border-purple-500/30 rounded-t-2xl rounded-br-2xl px-4 py-2 max-w-[90%]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs text-purple-400 font-bold tracking-wider">RANKUP AI</p>
                                        <Volume2 size={12} className="text-purple-400/50" />
                                    </div>
                                    <p className="text-white/90 text-sm leading-relaxed">{aiResponse}</p>
                                </div>
                            </div>
                        )}

                        {status === 'listening' && (
                            <div className="flex justify-center items-center gap-1.5 h-12 mt-4">
                                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                    <div key={i} className="w-1 bg-linear-to-t from-red-500 to-pink-500 rounded-full animate-wave" style={{ height: `${Math.random() * 25 + 10}px`, animationDelay: `-${i * 0.15}s` }} />
                                ))}
                            </div>
                        )}

                        {status === 'thinking' && (
                            <div className="flex flex-col items-center gap-3 mt-4 text-cyan-300 text-sm">
                                <Loader2 size={24} className="animate-spin" />
                                <span className="animate-pulse tracking-widest text-xs uppercase">Processing Data...</span>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 animate-slideUp">
                                <div className="w-1.5 h-full rounded-full bg-red-500" />
                                <p className="text-red-200 text-xs font-medium">{errorMessage || "Connection interrupted."}</p>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center pt-6 mt-2">
                        <button
                            onClick={toggleListening}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${status === 'listening'
                                    ? 'bg-red-500/20 text-red-400 border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
                                    : status === 'speaking'
                                        ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.4)]'
                                        : 'bg-blue-600 text-white border-2 border-transparent shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)]'
                                }`}
                        >
                            {status === 'listening' ? <MicOff size={28} /> :
                                status === 'speaking' ? <StopCircle size={28} className="animate-pulse" /> :
                                    <Mic size={28} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceAssistant;
