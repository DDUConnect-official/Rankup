import mongoose from "mongoose";

const userDsaProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    hasStarted: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: Date
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    totalChallengesCompleted: {
        type: Number,
        default: 0
    },
    totalXPEarned: {
        type: Number,
        default: 0
    },
    lastCompletedDate: {
        type: Date
    },
    completedDays: [Number], // Array of day numbers completed
    firstAttemptDays: [Number] // Days where XP was awarded
}, { timestamps: true });

export default mongoose.model("UserDsaProgress", userDsaProgressSchema);
