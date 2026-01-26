import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100">
                <div className="p-5">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full shrink-0 ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-950/50 p-3 flex justify-end gap-3 border-t border-zinc-900">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-lg transition-all transform active:scale-95 ${isDanger
                                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                            }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
