import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ModuleList = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            const user = auth.currentUser;
            const headers = user ? { "x-user-id": user.uid } : {};

            const response = await axios.get(`${API_URL}/api/admin/module`, { headers });
            setModules(response.data);
        } catch (error) {
            console.error("Error fetching modules:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteModule = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const user = auth.currentUser;
            await axios.delete(`${API_URL}/api/admin/module/${id}`, {
                headers: { "x-user-id": user.uid }
            });
            fetchModules();
        } catch (error) {
            console.error("Error deleting module:", error);
        }
    };

    if (loading) return <div className="p-4">Loading modules...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Modules</h1>
                <Link
                    to="/modules/new"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow"
                >
                    + New Module
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <div key={module._id} className="bg-white p-6 rounded-xl shadow border border-gray-100 hover:shadow-lg transition">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{module.icon || "📦"}</span>
                            <h2 className="text-xl font-bold text-gray-800">{module.name}</h2>
                        </div>
                        <p className="text-gray-500 mb-4 px-2 py-1 bg-gray-100 inline-block rounded text-xs">Order: {module.order}</p>
                        <div className="flex gap-2 mt-2">
                            <Link
                                to={`/modules/${module._id}/levels`}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition text-sm font-medium"
                            >
                                Levels
                            </Link>
                            <Link
                                to={`/modules/${module._id}/edit`}
                                className="bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition text-sm font-medium"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => deleteModule(module._id)}
                                className="bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100 transition text-sm font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModuleList;
