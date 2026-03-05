import express from "express";
import axios from "axios";
import Module from "../models/Module.js";
import Level from "../models/Level.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";

const router = express.Router();

// GET all modules (public)
router.get("/modules", async (req, res) => {
    try {
        const modules = await Module.find().sort({ order: 1 });
        res.json(modules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET levels for a specific module (published only)
router.get("/levels/:moduleId", async (req, res) => {
    try {
        const levels = await Level.find({ moduleId: req.params.moduleId, isPublished: true });
        res.json(levels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single level by ID
router.get("/level/:id", async (req, res) => {
    try {
        const level = await Level.findById(req.params.id);
        if (!level) return res.status(404).json({ message: "Level not found" });
        res.json(level);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET quiz for a level
router.get("/quiz/:levelId", async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ levelId: req.params.levelId });
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// SUBMIT quiz
router.post("/quiz/submit", async (req, res) => {
    const { userId, levelId, score } = req.body;
    try {
        let user;
        // Try finding by firebaseUid first
        user = await User.findOne({ uid: userId });

        // If not found, and userId is email
        if (!user && userId.includes("@")) {
            user = await User.findOne({ email: userId });
        }

        // If not found, and userId is valid MongoID
        if (!user && userId.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(userId);
        }

        if (!user) return res.status(404).json({ message: "User not found" });

        // Fetch Quiz to get passing score
        const quiz = await Quiz.findOne({ levelId });
        const passingScore = quiz ? quiz.passingScore : 70;

        // Check if level already completed
        const alreadyCompleted = user.completedLevels.find(l => l.levelId.toString() === levelId);

        let awardedXP = 0;
        let isMastered = false;

        if (score >= passingScore) {
            isMastered = true;
            if (!alreadyCompleted) {
                const level = await Level.findById(levelId);
                awardedXP = level.xpReward || 0;
                user.totalScore += awardedXP;
                user.completedLevels.push({
                    levelId: levelId,
                    quizScore: score
                });
                await user.save();
            }
        }

        res.json({
            message: isMastered ? (alreadyCompleted ? "Practice session completed!" : "Level Mastered!") : "Keep practicing!",
            totalScore: user.totalScore,
            alreadyCompleted: !!alreadyCompleted,
            isMastered,
            awardedXP,
            passingScore
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// VOICE SYNTHESIS (MURF AI)
import keyManager from "../utils/keyManager.js";
const voiceCache = new Map();

router.post("/synthesize", async (req, res) => {
    try {
        const { text, voiceId } = req.body;

        // Check Cache first
        const cacheKey = `${voiceId}_${text?.trim()}`;
        if (voiceCache.has(cacheKey)) {
            console.log("Serving from Cache:", cacheKey.substring(0, 30));
            return res.json({ audioUrl: voiceCache.get(cacheKey) });
        }

        console.log("Synthesize Request:", { text: text?.substring(0, 20) + "...", voiceId });

        const apiKey = keyManager.getNextKey('MURF');
        if (!apiKey) {
            return res.status(500).json({ message: "MURF_API_KEY not configured" });
        }

        // Murf AI API Call
        const response = await axios.post('https://api.murf.ai/v1/speech/generate', {
            voiceId: voiceId || 'en-US-marcus', // Default voice
            text: text,
            format: 'MP3',
            channel: 'MONO'
        }, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const audioUrl = response.data.audioFile;
        console.log("Murf API Response success. Audio URL:", audioUrl);

        // Save to Cache
        voiceCache.set(cacheKey, audioUrl);

        res.json({ audioUrl: audioUrl });
    } catch (err) {
        console.error("Murf AI Error Full:", err.response?.data || err.message);
        res.status(500).json({ message: "Failed to generate speech" });
    }
});

// GET: My Rank
router.get("/my-rank/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        let user;

        // Find user by multiple possible ID types
        user = await User.findOne({ uid: userId }) ||
            await User.findOne({ email: userId }) ||
            (userId.match(/^[0-9a-fA-F]{24}$/) ? await User.findById(userId) : null);

        if (!user) return res.status(404).json({ message: "User not found" });

        // Count how many users have more score than current user
        const higherScoringCount = await User.countDocuments({
            role: { $ne: "admin" },
            $or: [
                { totalScore: { $gt: user.totalScore } },
                { totalScore: user.totalScore, createdAt: { $lt: user.createdAt } }
            ]
        });

        res.json({
            rank: higherScoringCount + 1,
            totalScore: user.totalScore
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
