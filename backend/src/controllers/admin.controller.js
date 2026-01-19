import Module from "../models/Module.js";
import Level from "../models/Level.js";
import Game from "../models/Game.js";
import Quiz from "../models/Quiz.js";

// --- Module Management ---
export const createModule = async (req, res) => {
    try {
        const { name, icon, order } = req.body;
        const module = new Module({ name, icon, order });
        await module.save();
        res.status(201).json(module);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getModules = async (req, res) => {
    try {
        const modules = await Module.find().sort({ order: 1 });
        res.status(200).json(modules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateModule = async (req, res) => {
    try {
        const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(module);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteModule = async (req, res) => {
    try {
        await Module.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Module deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Level Management ---
export const createLevel = async (req, res) => {
    try {
        const level = new Level(req.body);
        await level.save();
        res.status(201).json(level);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLevelsByModule = async (req, res) => {
    try {
        const levels = await Level.find({ moduleId: req.params.moduleId }).sort({ order: 1 });
        res.status(200).json(levels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLevelDetails = async (req, res) => {
    try {
        const level = await Level.findById(req.params.id);
        if (!level) return res.status(404).json({ message: "Level not found" });

        const game = await Game.findOne({ levelId: level._id });
        const quiz = await Quiz.findOne({ levelId: level._id });

        res.status(200).json({ level, game, quiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateLevel = async (req, res) => {
    try {
        const level = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(level);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteLevel = async (req, res) => {
    try {
        await Level.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Level deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Game Management ---
export const addGameMetadata = async (req, res) => {
    try {
        const game = new Game(req.body);
        await game.save();
        await Level.findByIdAndUpdate(req.body.levelId, { hasGame: true });
        res.status(201).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGame = async (req, res) => {
    try {
        // Find by levelId or _id. req.body usually has levelId. 
        // But for REST, we usually invoke PUT /game/:id. 
        // Let's assume frontend sends game ID or we find by levelId.
        // Let's go with updating by game ID for consistency, or by levelId if we don't track game ID easily in frontend state (we do).
        const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// --- Quiz Management ---
export const createQuiz = async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        await Level.findByIdAndUpdate(req.body.levelId, { hasQuiz: true });
        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
