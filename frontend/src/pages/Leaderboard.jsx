import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Trophy, Crown, Star, ArrowLeft, Loader2, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Leaderboard = () => {
    const navigate = useNavigate();
    const { profileData } = useOutletContext();
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/leaderboard`);
                setTopUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="w-full min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    const podium = topUsers.slice(0, 3);
    const others = topUsers.slice(3);

    const PodiumCard = ({ user, rank, theme }) => {
        const themes = {
            1: {
                color: "text-yellow-500",
                bg: "bg-yellow-500/10",
                glow: "bg-yellow-500/20",
                sparkles: ["bg-yellow-400", "bg-amber-300", "bg-yellow-500", "bg-yellow-200"],
                size: "w-32 h-32",
                container: "p-8 shadow-[0_0_0px_rgba(234,179,8,0.1)]",
                border: "border! border-yellow-500/30",
                badge: "bg-yellow-500 text-black",
                crown: true
            },
            2: {
                color: "text-slate-300",
                bg: "bg-slate-500/10",
                glow: "bg-slate-500/30",
                sparkles: ["bg-slate-300", "bg-slate-100", "bg-slate-400", "bg-white"],
                size: "w-24 h-24",
                container: "p-6",
                border: "border! border-slate-400/30",
                badge: "bg-slate-400 text-black",
            },
            3: {
                color: "text-orange-400",
                bg: "bg-orange-950/10",
                glow: "bg-orange-900/30",
                sparkles: ["bg-orange-800", "bg-orange-600", "bg-amber-700", "bg-orange-500"],
                size: "w-24 h-24",
                container: "p-6",
                border: "border! border-orange-900/30",
                badge: "bg-orange-900 text-black",
            }
        };

        const t = themes[rank];

        return (
            <div className={`relative group flex flex-col items-center rounded-3xl backdrop-blur-2xl bg-white/5 transition-transform duration-500 hover:scale-[1.01] ${t.container}`}>
                {/* Glow BG */}
                <div className={`absolute inset-0 ${t.glow} blur-3xl rounded-full opacity-50`} />

                {/* Sparkles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className={`animate-sparkle rounded-full absolute bottom-0 ${t.sparkles[Math.floor(Math.random() * 4)]}`}
                            style={{
                                left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 2 + 2}px`,
                                height: `${Math.random() * 2 + 2}px`,
                                animationDuration: `${Math.random() * 3 + 4}s`,
                                animationDelay: `${Math.random() * 2}s`,
                                opacity: Math.random() * 0.4 + 0.2,
                            }}
                        />
                    ))}
                </div>

                {t.crown && <Crown className="absolute -top-10 text-yellow-500 w-14 h-14 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] animate-bounce" />}

                <div className="relative mb-4 z-10">
                    <div className={`${t.size} rounded-full border-4 ${t.border.replace('/30', '/50')} overflow-hidden shadow-2xl`}>
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className={`absolute -bottom-2 -right-2 ${t.badge} font-black w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-xl`}>
                        {rank}
                    </div>
                </div>

                <h3 className="text-xl font-black text-white mb-1 z-10">{user.username}</h3>
                <p className={`${t.color} text-xs mb-4 uppercase tracking-[0.2em] font-black z-10`}>{user.branch || "Ranker"}</p>

                <div className="flex items-center gap-2 bg-white/5 px-6 py-2 rounded-full border border-white/10 z-10">
                    <Star size={16} className={`${t.color} fill-current`} />
                    <span className="text-lg font-black text-white">{user.totalScore} XP</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-start md:p-2 animate-slideUpFade">
            {/* Glass Container */}
            <div className="w-full py-6 px-4 md:p-10 rounded-xl border border-white/10 backdrop-blur-2xl shadow-xl bg-black/5">

                {/* Back Button */}
                <div className="w-full flex justify-start mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">Back</span>
                    </button>
                </div>

                {/* Header Section */}
                <div className="text-center mb-20">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
                        RankUp <span className="text-white">Leaderboard</span>
                    </h1>
                    <p className="text-white/40 text-lg font-medium">Celebrating the top performers of our community.</p>
                </div>

                {/* Podium Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 items-end px-4">
                    {/* 2nd Place */}
                    <div className="md:order-1 order-2">
                        {podium[1] && <PodiumCard user={podium[1]} rank={2} />}
                    </div>

                    {/* 1st Place */}
                    <div className="md:order-2 order-1">
                        {podium[0] && <PodiumCard user={podium[0]} rank={1} />}
                    </div>

                    {/* 3rd Place */}
                    <div className="md:order-3 order-3">
                        {podium[2] && <PodiumCard user={podium[2]} rank={3} />}
                    </div>
                </div>

                {/* List Section Title */}
                <h2 className="text-xl text-white/80 font-bold mb-6 flex items-center gap-2 px-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                    Global Participants
                </h2>

                {/* List Section */}
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-8 py-6 text-xs font-black text-white/40 uppercase tracking-[0.2em]">Rank</th>
                                    <th className="px-8 py-6 text-xs font-black text-white/40 uppercase tracking-[0.2em]">User</th>
                                    <th className="px-8 py-6 text-xs font-black text-white/40 uppercase tracking-[0.2em]">College / Branch</th>
                                    <th className="px-8 py-6 text-xs font-black text-white/40 uppercase tracking-[0.2em] text-right">Experience</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm md:text-base">
                                {others.map((u, i) => {
                                    const isMe = u.username === profileData?.username;
                                    return (
                                        <tr
                                            key={u._id}
                                            className={`group transition-colors ${isMe ? 'bg-blue-500/10' : 'hover:bg-white/5'}`}
                                        >
                                            <td className="px-8 py-5 font-mono text-white/50">{i + 4}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-full border border-white/10 overflow-hidden bg-white/5 shrink-0">
                                                        <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`font-bold truncate ${isMe ? 'text-blue-400' : 'text-white'}`}>
                                                            {u.username} {isMe && <span className="ml-2 text-[9px] bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">YOU</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-xs text-white/60 font-medium truncate max-w-[250px]">{u.university || "RankUp University"}</p>
                                                <p className="text-[10px] text-white/30 uppercase font-black tracking-wider">{u.branch || "General"}</p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="inline-flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-xl border border-white/10 group-hover:border-white/20 transition-all">
                                                    <span className="font-black text-white font-mono">{u.totalScore}</span>
                                                    <span className="text-[10px] font-black text-white/40">XP</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
