import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    levelId: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true }
    }],
    passingScore: { type: Number, default: 70 }
}, { timestamps: true });

export default mongoose.model("Quiz", quizSchema);
