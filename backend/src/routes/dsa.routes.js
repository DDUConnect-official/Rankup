import express from "express";
import { getTodayChallenge, startChallenge, submitCode, getProgress } from "../controllers/dsa.controller.js";

const router = express.Router();

// Get today's challenge for user
router.get("/today/:userId", getTodayChallenge);

// Start the 100 days challenge
router.post("/start/:userId", startChallenge);

// Submit code for evaluation
router.post("/submit/:userId", submitCode);

// Get user's progress
router.get("/progress/:userId", getProgress);

export default router;
