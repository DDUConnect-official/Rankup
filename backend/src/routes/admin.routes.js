import express from "express";
import { isAdmin } from "../middleware/auth.middleware.js";
import {
    createModule,
    getModules,
    updateModule,
    deleteModule,
    createLevel,
    getLevelsByModule,
    getLevelDetails,
    updateLevel,
    deleteLevel,
    addGameMetadata,
    updateGame,
    createQuiz,
    updateQuiz,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(isAdmin);

router.post("/module", createModule);
router.get("/module", getModules);
router.put("/module/:id", updateModule);
router.delete("/module/:id", deleteModule);

router.post("/level", createLevel);
router.get("/level/:moduleId", getLevelsByModule);
router.get("/level/detail/:id", getLevelDetails);
router.put("/level/:id", updateLevel);
router.delete("/level/:id", deleteLevel);

router.post("/game", addGameMetadata);
router.put("/game/:id", updateGame);

router.post("/quiz", createQuiz);
router.put("/quiz/:id", updateQuiz);

export default router;
