import React from "react";
import { AlertTriangle, X, Zap, Flame } from "lucide-react";

const ConfirmSubmitDialog = ({ isOpen, onClose, onConfirm, xpToEarn, isFirstAttempt, streak }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white">Confirm Submission</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white/40 hover:text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Warning Icon */}
                    <div className="flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    {/* Message */}
                    <div className="text-center space-y-2">
                        <p className="text-white/80 text-sm leading-relaxed">
                            {isFirstAttempt ? (
                                <>
                                    This is your <span className="text-blue-400 font-bold">first submission</span> for today's challenge.
                                </>
                            ) : (
                                <>
                                    You've already submitted today. This will be a <span className="text-yellow-400 font-bold">practice attempt</span>.
                                </>
                            )}
                        </p>
                    </div>

                    {/* XP Info */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-white/60">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                <span>XP to Earn</span>
                            </div>
                            <span className={`text-lg font-bold ${isFirstAttempt ? 'text-yellow-400' : 'text-white/30'}`}>
                                {isFirstAttempt ? `+${xpToEarn}` : '0'} XP
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-white/60">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span>Current Streak</span>
                            </div>
                            <span className="text-lg font-bold text-orange-400">
                                {streak} {streak === 1 ? 'Day' : 'Days'}
                            </span>
                        </div>
                    </div>

                    {/* Important Note */}
                    {isFirstAttempt && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-xs text-blue-300 leading-relaxed">
                                <span className="font-bold">Important:</span> XP is only awarded on your first submission.
                                After this, you can practice unlimited times until tomorrow's challenge.
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 p-5 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-600/20"
                    >
                        Confirm Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmSubmitDialog;
