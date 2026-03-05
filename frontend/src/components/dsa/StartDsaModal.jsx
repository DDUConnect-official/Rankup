import React from "react";
import { Code2, X, Zap, ChevronRight } from "lucide-react";

const StartDsaModal = ({ isOpen, onClose, onStart }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Code2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">100 Days of DSA</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors group"
                    >
                        <X className="w-5 h-5 text-white/40 group-hover:text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 text-center space-y-6">
                    <div className="space-y-3">
                        <h4 className="text-2xl font-bold text-white tracking-tight">Ready for your Challenge?</h4>
                        <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                            Consistency is key to mastering algorithms. Solve one challenge daily and climb the leaderboard.
                        </p>
                    </div>

                    {/* Features/Rules */}
                    <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <Zap className="w-4 h-4 text-yellow-500 mb-2" />
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">XP Reward</p>
                            <p className="text-sm font-bold text-white">Up to 100 XP</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <Code2 className="w-4 h-4 text-blue-500 mb-2" />
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Daily Limit</p>
                            <p className="text-sm font-bold text-white">1 Challenge</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row items-center gap-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="w-full md:flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onStart}
                        className="w-full md:flex-[1.5] px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                        Start Today's Challenge
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StartDsaModal;
