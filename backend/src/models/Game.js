import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    levelId: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["logic", "reflex", "simulation"], required: true },
    difficulty: { type: String, enum: ["easy", "medium"], required: true },
    instructions: { type: String },
    xpReward: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Game", gameSchema);
