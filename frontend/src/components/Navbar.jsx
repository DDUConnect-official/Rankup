import React, { useState, useRef, useEffect } from "react";
import RankUpLogo from "../assets/RankUp_Logo.png";
import { useNavigate } from "react-router-dom";

const Navbar = ({ avatar, onLogout, onDelete }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] max-w-7xl z-50">
            <div className="backdrop-blur-2xl border border-white/5 rounded-xl px-2.5 md:px-4 flex items-center justify-between shadow-xl">
                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <img src={RankUpLogo} alt="RankUp" className="h-16 md:h-17 cursor-pointer" />
                </div>

                {/* Right: Profile */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
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

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute right-0 top-14 w-48 bg-[#121212] backdrop-blur-2xl shadow-3xl border border-white/10 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="py-2">
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate("/profile");
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                >
                                    My Profile
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        onLogout();
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                >
                                    Logout
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        onDelete();
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer border-t border-white/5 mt-1 pt-3"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
