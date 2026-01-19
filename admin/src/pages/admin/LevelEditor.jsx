import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase";
import TheoryEditor from "../../components/admin/TheoryEditor";
import QuizBuilder from "../../components/admin/QuizBuilder";
import GameMetadataForm from "../../components/admin/GameMetadataForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LevelEditor = () => {
    const { moduleId, levelId } = useParams();
    const navigate = useNavigate();

    const [level, setLevel] = useState({
        title: "",
        description: "",
        xpReward: 0,
        isPublished: false,
        theory: [],
        order: 0
    });

    const [game, setGame] = useState({
        name: "", type: "logic", difficulty: "easy", xpReward: 10
    });

    const [quiz, setQuiz] = useState({
        questions: [], passingScore: 50
    });

    const [hasGame, setHasGame] = useState(false);
    const [hasQuiz, setHasQuiz] = useState(false);

    // Store original IDs for updates
    const [gameId, setGameId] = useState(null);
    const [quizId, setQuizId] = useState(null);

    useEffect(() => {
        if (levelId) {
            fetchLevelDetails();
        }
    }, [levelId]);

    const fetchLevelDetails = async () => {
        try {
            const user = auth.currentUser;
            const headers = { "x-user-id": user.uid };
            const res = await axios.get(`${API_URL}/api/admin/level/detail/${levelId}`, { headers });
            const { level, game, quiz } = res.data;

            setLevel(level);
            if (game) {
                setGame(game);
                setHasGame(true);
                setGameId(game._id);
            }
            if (quiz) {
                setQuiz(quiz);
                setHasQuiz(true);
                setQuizId(quiz._id);
            }
        } catch (error) {
            console.error("Error fetching level details:", error);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            const headers = { "x-user-id": user.uid };

            let currentLevelId = levelId;

            if (levelId) {
                // UPDATE
                await axios.put(`${API_URL}/api/admin/level/${levelId}`, { ...level, hasGame, hasQuiz }, { headers });

                // Handle Game
                if (hasGame) {
                    if (gameId) {
                        await axios.put(`${API_URL}/api/admin/game/${gameId}`, game, { headers });
                    } else {
                        await axios.post(`${API_URL}/api/admin/game`, { ...game, levelId }, { headers });
                    }
                }
                // Handle Quiz
                if (hasQuiz) {
                    if (quizId) {
                        await axios.put(`${API_URL}/api/admin/quiz/${quizId}`, quiz, { headers });
                    } else {
                        await axios.post(`${API_URL}/api/admin/quiz`, { ...quiz, levelId }, { headers });
                    }
                }

            } else {
                // CREATE
                const levelRes = await axios.post(`${API_URL}/api/admin/level`, {
                    ...level,
                    moduleId,
                    hasGame,
                    hasQuiz
                }, { headers });

                currentLevelId = levelRes.data._id;

                if (hasGame) {
                    await axios.post(`${API_URL}/api/admin/game`, {
                        ...game, levelId: currentLevelId
                    }, { headers });
                }

                if (hasQuiz) {
                    await axios.post(`${API_URL}/api/admin/quiz`, {
                        ...quiz, levelId: currentLevelId
                    }, { headers });
                }
            }

            navigate(`/modules/${moduleId}/levels`);
        } catch (error) {
            console.error("Error saving level:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow border">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">{levelId ? "Edit Level" : "Create New Level"}</h1>
            <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="mb-4 grid grid-cols-12 gap-4">
                    <div className="col-span-8">
                        <label className="block text-gray-700 font-bold text-sm">Level Title</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded mt-1"
                            value={level.title}
                            onChange={(e) => setLevel({ ...level, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-gray-700 font-bold text-sm">Order</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded mt-1"
                            value={level.order}
                            onChange={(e) => setLevel({ ...level, order: Number(e.target.value) })}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-gray-700 font-bold text-sm">XP Reward</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded mt-1"
                            value={level.xpReward}
                            onChange={(e) => setLevel({ ...level, xpReward: Number(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 font-bold text-sm">Description</label>
                    <textarea
                        className="w-full p-2 border rounded mt-1"
                        value={level.description}
                        onChange={(e) => setLevel({ ...level, description: e.target.value })}
                    />
                </div>

                {/* Theory */}
                <TheoryEditor theory={level.theory} setTheory={(t) => setLevel({ ...level, theory: t })} />

                {/* Game Toggle */}
                <div className="mb-6 p-4 rounded bg-purple-50 border border-purple-100">
                    <label className="flex items-center gap-2 font-bold mb-2 cursor-pointer">
                        <input type="checkbox" checked={hasGame} onChange={(e) => setHasGame(e.target.checked)} />
                        Attach Game
                    </label>
                    {hasGame && <GameMetadataForm game={game} setGame={setGame} />}
                </div>

                {/* Quiz Toggle */}
                <div className="mb-6 p-4 rounded bg-green-50 border border-green-100">
                    <label className="flex items-center gap-2 font-bold mb-2 cursor-pointer">
                        <input type="checkbox" checked={hasQuiz} onChange={(e) => setHasQuiz(e.target.checked)} />
                        Attach Quiz
                    </label>
                    {hasQuiz && <QuizBuilder quiz={quiz} setQuiz={setQuiz} />}
                </div>

                {/* Publish Toggle */}
                <div className="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded">
                    <label className="flex items-center gap-2 font-bold text-gray-800 cursor-pointer">
                        <input type="checkbox" checked={level.isPublished} onChange={(e) => setLevel({ ...level, isPublished: e.target.checked })} />
                        Publish Immediately
                    </label>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700 font-bold shadow transition"
                    >
                        Create Level
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LevelEditor;
