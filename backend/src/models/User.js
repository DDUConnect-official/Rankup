import mongoose from "mongoose";

const attemptedProblemSchema = new mongoose.Schema({
  problemId: { type: String, required: true },
  score: { type: Number, required: true },
  languageUsed: { type: String, required: true },
  attemptedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Your firebaseUid
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true }, // Sparse allows nulls until setup
  avatar: { type: String },
  branch: { type: String },
  university: { type: String },
  aboutMe: { type: String },
  totalScore: { type: Number, default: 0 },
  attemptedProblemsCount: { type: Number, default: 0 },
  solvedProblemsCount: { type: Number, default: 0 },
  profileCompleted: { type: Boolean, default: false },
  hasSeenWelcomeGuide: { type: Boolean, default: false },
  attemptedProblems: [attemptedProblemSchema] // One-to-many relationship
}, { timestamps: true });

export default mongoose.model("User", userSchema);