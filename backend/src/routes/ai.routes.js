
import express from "express";
import { chatWithAI, getCareerAdvice, careerFollowup } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/chat", chatWithAI);
router.post("/career-advice", getCareerAdvice);
router.post("/career-followup", careerFollowup);

export default router;
