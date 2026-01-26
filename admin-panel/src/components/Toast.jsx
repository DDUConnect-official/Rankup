import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border animate-in slide-in-from-right fade-in duration-300 ${type === 'success'
                ? 'bg-zinc-900 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-900 border-red-500/30 text-red-400'
            }`}>
            {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-200">{message}</p>
            <button onClick={onClose} className="ml-2 hover:bg-zinc-800 p-1 rounded-full transition-colors">
                <X size={14} className="text-zinc-500" />
            </button>
        </div>
    );
};

export default Toast;
