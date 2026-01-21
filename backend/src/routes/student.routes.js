import express from "express";
import Module from "../models/Module.js";
import Level from "../models/Level.js";

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

export default router;
