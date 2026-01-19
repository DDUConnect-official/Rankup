import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";

const AdminLayout = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate("/");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        const auth = getAuth();
        await signOut(auth);
        navigate("/");
    };

    if (loading) return <div className="p-8">Checking auth...</div>;

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
                <div className="p-6 text-2xl font-bold border-b border-gray-700 flex justify-between items-center">
                    <span>RankUp Admin</span>
                </div>
                <nav className="flex-1 mt-6">
                    <ul className="flex md:block overflow-x-auto md:overflow-visible">
                        <li>
                            <Link to="/dashboard" className="block px-6 py-3 hover:bg-gray-800 transition whitespace-nowrap">
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/modules" className="block px-6 py-3 hover:bg-gray-800 transition whitespace-nowrap">
                                Modules
                            </Link>
                        </li>
                        {/* Future links */}
                    </ul>
                </nav>
                <div className="p-4 border-t border-gray-700 hidden md:block">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-800 text-red-400 transition"
                    >
                        Logout
                    </button>
                </div>
                {/* Mobile Logout */}
                <div className="p-4 border-t border-gray-700 md:hidden">
                    <button
                        onClick={handleLogout}
                        className="w-full text-center px-4 py-2 hover:bg-gray-800 text-red-400 transition"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
