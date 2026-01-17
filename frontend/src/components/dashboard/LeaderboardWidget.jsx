import React, { useMemo } from "react";
import { Crown } from "lucide-react";
import { avatarList } from "../../constants/avatars";

const LeaderboardWidget = ({ profileData }) => {
    // Get random avatars that are NOT the current user's avatar
    const randomAvatars = useMemo(() => {
        if (!profileData?.avatar) return [];

        // Filter out the current user's avatar
        const available = avatarList.filter(a => a.url !== profileData.avatar);

        // Shuffle and pick 2
        return available.sort(() => 0.5 - Math.random()).slice(0, 2);
    }, [profileData?.avatar]);

    const rank2 = randomAvatars[0] || avatarList[0];
    const rank3 = randomAvatars[1] || avatarList[1];

    return (
        <div className="relative group cursor-pointer w-full md:w-auto rounded-2xl overflow-hidden transition-all hover:scale-[1.01]">

            {/* 1. The Shiny Border Layer (Masked, behind content) */}
            <div className="absolute inset-0 rounded-2xl z-0 mask-border pointer-events-none">
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_45%,rgba(255,255,255,0.6)_50%,transparent_55%,transparent_100%)] animate-[spin_6s_linear_infinite]" />
            </div>

            {/* 2. The Transparent Content Layer */}
            <div className="relative z-10 h-full w-full rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center gap-6 p-4">

                {/* Avatars Cluster */}
                <div className="flex items-center -space-x-3 pl-2 pt-3">
                    {/* Rank 2 */}
                    <div className="relative z-10 w-10 h-10 rounded-full border-2 border-[#121212] bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src={rank2.url} alt="Rank 2" className="w-full h-full object-cover" />
                    </div>

                    {/* Rank 1 */}
                    <div className="relative z-20 w-14 h-14 rounded-full border-2 border-[#121212] bg-yellow-900 text-yellow-200 flex items-center justify-center font-bold">
                        <Crown className="absolute -top-5 text-yellow-500 w-5 h-5 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-bounce" />
                        {profileData?.avatar ? <img src={profileData.avatar} alt="User" className="w-full h-full object-cover rounded-full" /> : <span>YOU</span>}
                    </div>

                    {/* Rank 3 */}
                    <div className="relative z-0 w-10 h-10 rounded-full border-2 border-[#121212] bg-orange-950 flex items-center justify-center overflow-hidden">
                        <img src={rank3.url} alt="Rank 3" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Rank Text */}
                <div className="flex flex-col items-center justify-center border-l border-white/10 pl-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Global Rank</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold text-white"># 1</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LeaderboardWidget;
