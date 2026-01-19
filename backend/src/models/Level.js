import mongoose from "mongoose";

const theorySchema = new mongoose.Schema({
    type: { type: String, enum: ["paragraph", "bullet"], required: true },
    content: { type: String, required: true }
});

const levelSchema = new mongoose.Schema({
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    title: { type: String, required: true },
    description: { type: String },
    theory: [theorySchema],
    xpReward: { type: Number, default: 0 },
    hasGame: { type: Boolean, default: false },
    hasQuiz: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Level", levelSchema);
