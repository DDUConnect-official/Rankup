import React from "react";
import RankUpLogo from "../assets/RankUp_Logo.png";
import { useNavigate } from "react-router-dom";

const Navbar = ({ avatar, onLogout, onDelete }) => {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-3 left-1/2 -translate-x-1/2 w-[95%] md:w-[80%] max-w-7xl z-50">
            <div className="backdrop-blur-2xl border border-white/5 rounded-xl px-2.5 md:px-4 flex items-center justify-between shadow-xl">
                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <img src={RankUpLogo} alt="RankUp" className="h-16 md:h-17 cursor-pointer" onClick={() => navigate("/dashboard")} />
                </div>

                {/* Right: Profile */}
                <div className="relative">
                    <button
                        onClick={() => navigate("/profile")}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 cursor-pointer transition-all hover:scale-105"
                    >
                        {/* Fallback to gray circle if no avatar */}
                        {avatar ? (
                            <img
                                src={avatar}
                                alt="User Avatar"
                                className="w-full h-full rounded-full object-cover transition-all"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-xs">
                                U
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
