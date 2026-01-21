import express from "express";
import { isAdmin } from "../middleware/admin.middleware.js";
import Module from "../models/Module.js";
import Level from "../models/Level.js";
import Game from "../models/Game.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";

const router = express.Router();

// Apply isAdmin middleware to all routes in this router
router.use(isAdmin);

// --- Users Route ---
router.get("/users", async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: "admin" } }).select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Stats Route ---
router.get("/stats", async (req, res) => {
    try {
        const modulesCount = await Module.countDocuments();
        const levelsCount = await Level.countDocuments();
        const usersCount = await User.countDocuments();

        res.json({
            modules: modulesCount,
            levels: levelsCount,
            students: usersCount,
            status: 'Online'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Module Routes ---
router.get("/modules", async (req, res) => {
    try {
        const modules = await Module.find().sort({ order: 1 });
        res.json(modules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/module/:id", async (req, res) => {
    try {
        const updated = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- Level Routes ---
router.get("/levels/:moduleId", async (req, res) => {
    try {
        const levels = await Level.find({ moduleId: req.params.moduleId });
        res.json(levels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/level", async (req, res) => {
    try {
        const level = new Level(req.body);
        const saved = await level.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put("/level/:id", async (req, res) => {
    try {
        const updated = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete("/level/:id", async (req, res) => {
    try {
        await Level.findByIdAndDelete(req.params.id);
        // Optionally delete associated quiz/game
        await Quiz.findOneAndDelete({ levelId: req.params.id });
        await Game.findOneAndDelete({ levelId: req.params.id });
        res.json({ message: "Level deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Quiz Routes ---
router.post("/quiz", async (req, res) => {
    try {
        const { levelId } = req.body;
        // Upsert: Update if exists, Create if not
        const quiz = await Quiz.findOneAndUpdate(
            { levelId }, 
            req.body, 
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(200).json(quiz);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get("/quiz/:levelId", async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ levelId: req.params.levelId });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/quiz/:levelId", async (req, res) => {
    try {
        await Quiz.findOneAndDelete({ levelId: req.params.levelId });
        res.json({ message: "Quiz deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Game Routes ---
router.post("/game", async (req, res) => {
    try {
        const game = new Game(req.body);
        const saved = await game.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get("/game/:levelId", async (req, res) => {
    try {
        const game = await Game.findOne({ levelId: req.params.levelId });
        res.json(game);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
