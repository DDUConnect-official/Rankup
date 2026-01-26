import mongoose from "mongoose";

const levelSchema = new mongoose.Schema({
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    title: { type: String, required: true },
    levelNumber: { type: Number, required: true, default: 1 },
    description: { type: String },
    content: [{
        type: { type: String, enum: ['paragraph', 'bullet', 'example'], default: 'paragraph' },
        title: { type: String },
        data: { type: String }
    }],
    xpReward: { type: Number, default: 0 },
    hasGame: { type: Boolean, default: false },
    hasQuiz: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Level", levelSchema);
