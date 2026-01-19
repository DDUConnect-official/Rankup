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
                        <div className="absolute right-0 top-14 w-fit min-w-[100px] bg-black/80 backdrop-blur-xl shadow-2xl border border-white/20 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate("/profile");
                                    }}
                                    className="w-full text-center px-6 py-3 text-sm font-medium text-white/80 cursor-pointer whitespace-nowrap"
                                >
                                    My Profile
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
