
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Star, Lock, Play } from "lucide-react";
import axios from "axios";
import Loader from "../components/Loader";

const Levels = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [moduleName, setModuleName] = useState("");

    useEffect(() => {
        const fetchLevels = async () => {
            try {
                // Fetch module info (optional, or pass via state)
                // Fetch levels
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/levels/${moduleId}`);
                setLevels(res.data);
                
                // Infer module name from local state or another fetch (simplifying for now)
                // Ideally backend sends module details or we fetch module by ID
            } catch (err) {
                console.error("Failed to fetch levels", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLevels();
    }, [moduleId]);

    if (loading) return <Loader text="Loading Levels..." fullScreen />;

    return (
        <div className="w-full min-h-screen p-4 md:p-8 animate-slideUpFade">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center gap-4">
                <button 
                    onClick={() => navigate("/dashboard")}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="text-white" />
                </button>
                <h1 className="text-3xl font-bold text-white">Module Levels</h1>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levels.length > 0 ? (
                    levels.map((level, index) => (
                        <div key={level._id} className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:border-blue-500/50 transition-all group relative overflow-hidden">
                            {/* Decorative BG */}
                            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-bold text-yellow-200">{level.xpReward} XP</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{level.title}</h3>
                                <p className="text-white/60 text-sm mb-6 line-clamp-2">{level.description}</p>

                                <button 
                                    onClick={() => navigate(`/level/${level._id}`)}
                                    className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                                >
                                    <Play size={16} fill="currentColor" />
                                    START LEVEL
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20">
                        <p className="text-white/40 text-lg">No levels available for this module yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Levels;
