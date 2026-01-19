import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Module Management Card */}
                <Link to="/modules" className="block group">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition h-full">
                        <div className="text-4xl mb-4">📚</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600">Module Management</h2>
                        <p className="text-gray-500">Create, edit, and organize learning modules (Maths, Science, etc.).</p>
                    </div>
                </Link>

                {/* Feature Explanation Cards (Static for now to show capabilities) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 opacity-75">
                    <div className="text-4xl mb-4">🎮</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Game & Info Management</h2>
                    <p className="text-gray-500">Manage Levels inside Modules to attach Games, Theory, and Quizzes.</p>
                    <Link to="/modules" className="text-blue-500 text-sm mt-4 inline-block font-bold">Go to Modules to Manage Levels &rarr;</Link>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
