import React from "react";

const GameMetadataForm = ({ game, setGame }) => {
    return (
        <div className="border p-4 rounded bg-purple-50 mb-6">
            <h3 className="font-bold mb-4">Game Metadata</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm">Game Name</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={game.name}
                        onChange={(e) => setGame({ ...game, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm">Type</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={game.type}
                        onChange={(e) => setGame({ ...game, type: e.target.value })}
                    >
                        <option value="logic">Logic</option>
                        <option value="reflex">Reflex</option>
                        <option value="simulation">Simulation</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm">Difficulty</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={game.difficulty}
                        onChange={(e) => setGame({ ...game, difficulty: e.target.value })}
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm">XP Reward</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={game.xpReward}
                        onChange={(e) => setGame({ ...game, xpReward: Number(e.target.value) })}
                    />
                </div>
            </div>
        </div>
    );
};

export default GameMetadataForm;
