import express from "express";
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

        // Check if level already completed
        const alreadyCompleted = user.completedLevels.find(l => l.levelId.toString() === levelId);
        
        if (!alreadyCompleted) {
             const level = await Level.findById(levelId);
             
             user.totalScore += level.xpReward || 0;
             user.completedLevels.push({
                 levelId: levelId,
                 quizScore: score
             });
             await user.save();
        }
        
        res.json({ message: "Progress saved", totalScore: user.totalScore, alreadyCompleted: !!alreadyCompleted });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
