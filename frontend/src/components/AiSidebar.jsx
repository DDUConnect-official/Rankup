import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Loader2, Send, MessageSquare, History, Zap, Sparkles } from 'lucide-react';
import axios from 'axios';

const AiSidebar = ({ context, isOpen, onClose }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [inputText, setInputText] = useState('');
    const [status, setStatus] = useState('idle'); // idle, listening, thinking, speaking, error
    const [errorMessage, setErrorMessage] = useState('');

    const recognitionRef = useRef(null);
    const audioRef = useRef(new Audio());
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, status]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setStatus('listening');
            };

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const result = event.results[current][0].transcript;
                handleChat(result);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                setStatus('idle');
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                if (status === 'listening') setStatus('idle');
            };
        }
    }, []);

    const handleChat = async (text) => {
        if (!text.trim()) return;

        // Add user message to history
        const userMsg = { role: 'user', content: text, timestamp: new Date() };
        setChatHistory(prev => [...prev, userMsg]);
        setInputText('');
        setTranscript('');

        setStatus('thinking');

        try {
            const contextText = context ? context.map(item => typeof item === 'string' ? item : (item.title + ": " + item.data)).join("\n") : "";

            const chatRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`, {
                message: text,
                chatHistory: chatHistory.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })),
                context: contextText
            });
            const textResponse = chatRes.data.response;

            // Add AI message to history
            const aiMsg = { role: 'ai', content: textResponse, timestamp: new Date() };
            setChatHistory(prev => [...prev, aiMsg]);

            // Synthesize to Voice
            setStatus('speaking');
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
            setErrorMessage(err.response?.data?.message || "Connection interrupted.");
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const playAudio = (url) => {
        setStatus('speaking');
        audioRef.current.src = url;
        audioRef.current.play()
            .then(() => {
                audioRef.current.onended = () => setStatus('idle');
            })
            .catch(() => setStatus('idle'));
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            audioRef.current.pause();
            if (recognitionRef.current) {
                recognitionRef.current.start();
            }
        }
    };

    if (!isOpen) return null;

    return (
        <aside className="w-full h-dvh md:h-full bg-[#080808] border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 md:p-4 pt-25 md:pt-4 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Companion</h3>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${status !== 'idle' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                            <span className="text-[10px] text-white/40 font-medium uppercase tracking-tighter">
                                {status === 'idle' ? 'Ready' : status}
                            </span>
                        </div>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white/60 hover:text-white transition-all shadow-lg active:scale-95">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-2">
                            <MessageSquare className="w-8 h-8 text-white/10" />
                        </div>
                        <p className="text-white/40 text-sm max-w-[200px]">
                            Ask me anything about this lesson! I can explain concepts or help with examples.
                        </p>
                    </div>
                ) : (
                    chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none border border-blue-500/50'
                                : 'bg-white/5 text-white/80 rounded-tl-none border border-white/10'
                                }`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <span className="text-[10px] opacity-30 mt-1 block">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                {status === 'thinking' && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                            <span className="text-xs text-white/40">Analyzing context...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="relative group">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleChat(inputText)}
                        placeholder="Type a message..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                            onClick={toggleListening}
                            className={`p-2 rounded-lg transition-colors ${status === 'listening' ? 'text-red-500 bg-red-500/10' : 'text-white/20 hover:text-white'}`}
                        >
                            <Mic size={18} />
                        </button>
                        <button
                            onClick={() => handleChat(inputText)}
                            disabled={!inputText.trim()}
                            className="p-2 text-blue-400 hover:text-blue-300 disabled:text-white/10 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-between px-1">
                    <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest flex items-center gap-1">
                        <Zap size={10} className="text-yellow-500" />
                        RankUp Intelligence
                    </p>
                    {status === 'speaking' && (
                        <div className="flex items-center gap-1.5">
                            <Volume2 size={12} className="text-blue-400 animate-pulse" />
                            <span className="text-[10px] text-blue-400/60 font-bold animate-pulse uppercase">AI Voice Active</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default AiSidebar;
