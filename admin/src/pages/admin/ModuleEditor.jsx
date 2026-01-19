import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ModuleEditor = () => {
    const { id } = useParams(); // Get module ID from URL if editing
    const [name, setName] = useState("Maths");
    const [icon, setIcon] = useState("");
    const [order, setOrder] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchModule();
        }
    }, [id]);

    const fetchModule = async () => {
        try {
            const user = auth.currentUser;
            // Find the specific module from the list (or backend could have a get-one endpoint)
            const response = await axios.get(`${API_URL}/api/admin/module`, {
                headers: { "x-user-id": user.uid }
            });
            const mod = response.data.find(m => m._id === id);
            if (mod) {
                setName(mod.name);
                setIcon(mod.icon || "");
                setOrder(mod.order);
            }
        } catch (error) {
            console.error("Error fetching module:", error);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            const headers = { "x-user-id": user.uid };

            if (id) {
                await axios.put(`${API_URL}/api/admin/module/${id}`, { name, icon, order }, { headers });
            } else {
                await axios.post(`${API_URL}/api/admin/module`, { name, icon, order }, { headers });
            }
            navigate("/modules");
        } catch (error) {
            console.error("Error saving module:", error);
        }
    };

    return (
        <div className="max-w-full md:max-w-xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">{id ? "Edit Module" : "Create New Module"}</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Module Name</label>
                    <select
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    >
                        <option value="Maths">Maths</option>
                        <option value="Science">Science</option>
                        <option value="Coding">Coding</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Module Icon (Emoji or URL)</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="e.g. 📐 or https://..."
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Display Order</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={order}
                        onChange={(e) => setOrder(Number(e.target.value))}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition font-bold"
                >
                    {id ? "Update Module" : "Create Module"}
                </button>
            </form>
        </div>
    );
};

export default ModuleEditor;
