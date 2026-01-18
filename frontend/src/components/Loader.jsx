import React from 'react'

const Loader = ({ text = "Ranking You Up...", fullScreen = true }) => {
    const containerClasses = fullScreen
        ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
        : "flex flex-col items-center justify-center bg-black p-10";

    return (
        <div className={containerClasses}>
            <div className='loader'></div>
            {text && (
                <p className="mt-8 text-white/80 text-lg font-bold uppercase tracking-widest animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

export default Loader