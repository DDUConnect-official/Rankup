import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RankUpLogo from "../assets/RankUp_Logo.png";
import { LayoutDashboard, LogOut } from "lucide-react";

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="w-64 bg-zinc-950 border-r border-zinc-900 flex-col h-screen shrink-0 hidden md:flex">
            {/* Brand */}
            <div className="p-5 flex items-center justify-center">
                <img src={RankUpLogo} alt="RankUp" className="h-20" />
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-2">
                <p className="px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-800 mb-4">Workspace</p>
                <Link
                    to="/"
                    className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all
            ${location.pathname === "/" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-white"}`}
                >
                    <LayoutDashboard size={16} />
                    Dashboard
                </Link>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-900">
                <button
                    onClick={async () => { await logout(); navigate("/login"); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-zinc-700 hover:text-red-500 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                    <LogOut size={14} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
