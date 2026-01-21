import mongoose from "mongoose";

const levelSchema = new mongoose.Schema({
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    title: { type: String, required: true },
    description: { type: String },
    theory: [{
        type: { type: String, enum: ["paragraph", "bullet"], required: true },
        content: { type: String, required: true }
    }],
    xpReward: { type: Number, default: 0 },
    hasGame: { type: Boolean, default: false },
    hasQuiz: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Level", levelSchema);
