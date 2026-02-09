import mongoose from "mongoose";

const dsaSubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DsaChallenge",
        required: true
    },
    dayNumber: {
        type: Number,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ["javascript", "c", "cpp", "java"],
        default: "javascript"
    },
    score: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    xpAwarded: {
        type: Number,
        default: 0
    },
    isFirstAttempt: {
        type: Boolean,
        default: false
    },
    aiEvaluation: {
        syntaxScore: Number,
        logicScore: Number,
        qualityScore: Number,
        efficiencyScore: Number,
        feedback: String,
        syntaxErrors: [String]
    }
}, { timestamps: true });

// Index for faster queries
dsaSubmissionSchema.index({ userId: 1, challengeId: 1 });
dsaSubmissionSchema.index({ userId: 1, dayNumber: 1 });

export default mongoose.model("DsaSubmission", dsaSubmissionSchema);
