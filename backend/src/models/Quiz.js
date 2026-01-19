import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }
});

const quizSchema = new mongoose.Schema({
    levelId: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
    questions: [questionSchema],
    passingScore: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Quiz", quizSchema);
