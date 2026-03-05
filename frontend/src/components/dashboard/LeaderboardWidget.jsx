import React, { useState, useEffect } from "react";
import { Crown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LeaderboardWidget = ({ profileData }) => {
    const navigate = useNavigate();
    const [topStats, setTopStats] = useState({
        rank: 0,
        podium: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankInfo = async () => {
            if (!profileData?._id && !profileData?.uid) return;

            try {
                // Fetch user rank
                const rankRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/my-rank/${profileData.uid || profileData._id}`);

                // Fetch top 3 for the widget cluster
                const leaderboardRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/leaderboard`);

                setTopStats({
                    rank: rankRes.data.rank,
                    podium: leaderboardRes.data.slice(0, 3)
                });
            } catch (err) {
                console.error("Failed to fetch rank info", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRankInfo();
    }, [profileData]);

    if (loading) {
        return (
            <div className="relative w-full md:w-64 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center p-4 h-[88px]">
                <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
            </div>
        );
    }

    const { rank, podium } = topStats;
    // Fallback if less than 3 users
    const displayPodium = podium.length >= 3 ? podium : [...podium, ...Array(3 - podium.length).fill({ avatar: "" })];

    // We want the middle one to be Rank 1, Left Rank 2, Right Rank 3
    const rank1 = displayPodium[0];
    const rank2 = displayPodium[1];
    const rank3 = displayPodium[2];

    return (
        <div
            onClick={() => navigate("/leaderboard")}
            className="relative group cursor-pointer w-full md:w-auto rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
        >
            {/* 1. The Shiny Border Layer */}
            <div className="absolute inset-0 rounded-2xl z-0 mask-border pointer-events-none">
                <div className="absolute -inset-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_45%,rgba(255,255,255,0.6)_50%,transparent_55%,transparent_100%)] animate-[spin_6s_linear_infinite]" />
            </div>

            {/* 2. Content Layer */}
            <div className="relative z-10 h-full w-full rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center gap-6 p-4">

                {/* Avatars Cluster */}
                <div className="flex items-center -space-x-3 pl-2 pt-3">
                    {/* Rank 2 */}
                    <div className="relative z-10 w-10 h-10 rounded-full border-2 border-[#121212] bg-slate-800 flex items-center justify-center overflow-hidden">
                        {rank2?.avatar ? <img src={rank2.avatar} alt="2" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700" />}
                    </div>

                    {/* Rank 1 */}
                    <div className="relative z-20 w-14 h-14 rounded-full border-2 border-[#121212] bg-yellow-900 flex items-center justify-center font-bold">
                        <Crown className="absolute -top-5 text-yellow-500 w-5 h-5 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-bounce" />
                        {rank1?.avatar ? <img src={rank1.avatar} alt="1" className="w-full h-full object-cover rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)]" /> : <span className="text-yellow-500 text-xs">TOP</span>}
                    </div>

                    {/* Rank 3 */}
                    <div className="relative z-0 w-10 h-10 rounded-full border-2 border-[#121212] bg-orange-950 flex items-center justify-center overflow-hidden">
                        {rank3?.avatar ? <img src={rank3.avatar} alt="3" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-orange-900/50" />}
                    </div>
                </div>

                {/* Rank Text */}
                <div className="flex flex-col items-center justify-center border-l border-white/10 pl-6 pr-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Global Rank</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-4xl font-black text-white tracking-tighter"># {rank || "---"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardWidget;
