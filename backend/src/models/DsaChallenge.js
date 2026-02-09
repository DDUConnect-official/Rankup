import mongoose from "mongoose";

const dsaChallengeSchema = new mongoose.Schema({
    dayNumber: {
        type: Number,
        required: true,
        unique: true,
        min: 1,
        max: 100
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true
    },
    constraints: [String],
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    hints: [String],
    tags: [String],
    testCases: [{
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: false }
    }],
    maxXP: {
        type: Number,
        default: 100
    }
}, { timestamps: true });

export default mongoose.model("DsaChallenge", dsaChallengeSchema);
