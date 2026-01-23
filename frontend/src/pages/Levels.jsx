
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Star, Lock, Play } from "lucide-react";
import axios from "axios";
import Loader from "../components/Loader";
import ModuleProgressWidget from "../components/dashboard/ModuleProgressWidget";

const Levels = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [moduleInfo, setModuleInfo] = useState(null);

    // Color/Gradient maps
    const gradientMap = {
        maths: "from-purple-500 to-indigo-500",
        science: "from-emerald-400 to-cyan-500",
        coding: "from-orange-400 to-amber-500",
    };

    const textGradientMap = {
        maths: "from-purple-400 via-indigo-500 to-blue-500",
        science: "from-emerald-400 via-teal-500 to-cyan-500",
        coding: "from-orange-400 via-amber-500 to-yellow-500",
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch module info
                const modulesRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/modules`);
                const currentModule = modulesRes.data.find(m => m._id === moduleId);
                setModuleInfo(currentModule);

                // Fetch levels
                const levelsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/levels/${moduleId}`);
                setLevels(levelsRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [moduleId]);

    if (loading) return <Loader text="Loading Levels..." fullScreen />;

    const moduleNameKey = moduleInfo?.name?.toLowerCase() || "maths";
    const totalXp = levels.reduce((acc, curr) => acc + (curr.xpReward || 0), 0);

    return (
        <div className="w-full min-h-screen p-4 md:p-8 animate-slideUpFade flex flex-col items-center">

            {/* Main Glass Container */}
            <div className="w-full max-w-7xl p-4 md:p-10 rounded-xl border border-white/10 backdrop-blur-2xl shadow-xl bg-black/20">

                {/* Header Section */}
                <div className="w-full flex flex-col items-center gap-6 mb-12 md:flex-row md:items-end md:justify-between animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Title Area */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors backdrop-blur-md cursor-pointer group"
                        >
                            <ArrowLeft className="text-white w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>

                        <div className="text-left">
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                {moduleInfo?.name || "Module"} Zone
                            </h1>
                            <p className="text-white/50 text-lg">Master the concepts and conquer the levels.</p>
                        </div>
                    </div>

                    {/* Stats Widget */}
                    <ModuleProgressWidget
                        totalLevels={levels.length}
                        levelsCompleted={0} // TODO: Fetch real user progress
                        totalXp={totalXp}
                    />
                </div>

                {/* Section Title */}
                <h2 className="text-xl text-white/80 font-bold mb-6 flex items-center gap-2">
                    <span className={`w-1 h-6 bg-gradient-to-b ${gradientMap[moduleNameKey] || "from-blue-500 to-purple-500"} rounded-full`}></span>
                    Available Levels
                </h2>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {levels.length > 0 ? (
                        levels.map((level, index) => (
                            <div key={level._id} className="group relative bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl overflow-hidden">
                                {/* Decorative BG */}
                                <div className={`absolute inset-0 bg-gradient-to-br`} />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl text-white/80 border border-white/10 bg-white/5 group-hover:scale-110 transition-transform duration-300`}>
                                            <BookOpen size={24} />
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-bold text-yellow-200">{level.xpReward} XP</span>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors line-clamp-1">{level.title}</h3>
                                    <p className="text-white/60 text-sm mb-6 line-clamp-2 grow">{level.description}</p>

                                    <button
                                        onClick={() => navigate(`/level/${level._id}`)}
                                        className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-white/10"
                                    >
                                        <Play size={18} fill="currentColor" />
                                        START LEVEL
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm">
                            <div className="p-6 bg-white/5 rounded-full mb-4">
                                <Lock className="w-12 h-12 text-white/20" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Levels Yet</h3>
                            <p className="text-white/40 max-w-sm">We are currently crafting new levels for this module. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Levels;
