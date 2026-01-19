import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LevelManager = () => {
    const { moduleId } = useParams();
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLevels();
    }, [moduleId]);

    const fetchLevels = async () => {
        try {
            const user = auth.currentUser;
            const headers = user ? { "x-user-id": user.uid } : {};
            const response = await axios.get(`${API_URL}/api/admin/level/${moduleId}`, { headers });
            setLevels(response.data);
        } catch (error) {
            console.error("Error fetching levels:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteLevel = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const user = auth.currentUser;
            await axios.delete(`${API_URL}/api/admin/level/${id}`, {
                headers: { "x-user-id": user.uid }
            });
            fetchLevels();
        } catch (error) {
            console.error("Error:", error);
        }
    }

    if (loading) return <div>Loading levels...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Levels</h1>
                <Link
                    to={`/modules/${moduleId}/levels/new`}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    + New Level
                </Link>
            </div>

            <div className="space-y-3">
                {levels.length === 0 && <p className="text-gray-500">No levels found.</p>}
                {levels.map((level) => (
                    <div key={level._id} className="bg-white p-4 rounded shadow-sm border border-gray-200 flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-700 w-8">{level.order || "-"}</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{level.title}</h3>
                                <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                    <span className={`px-2 py-0.5 rounded ${level.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                        {level.isPublished ? "Published" : "Draft"}
                                    </span>
                                    {level.hasGame && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Game</span>}
                                    {level.hasQuiz && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Quiz</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link to={`/modules/${moduleId}/levels/${level._id}/edit`} className="text-blue-500 hover:text-blue-700 font-medium px-2">Edit</Link>
                            <button onClick={() => deleteLevel(level._id)} className="text-red-400 hover:text-red-600 font-medium">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LevelManager;
