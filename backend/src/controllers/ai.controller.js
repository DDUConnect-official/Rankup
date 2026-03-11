import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import keyManager from "../utils/keyManager.js";
import User from "../models/User.js";
import UserDsaProgress from "../models/UserDsaProgress.js";
import Level from "../models/Level.js";
import Module from "../models/Module.js";

dotenv.config();

export const chatWithAI = async (req, res) => {
    try {
        console.log("AI Chat Request received:", req.body);
        const { message, chatHistory, context } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        // Get rotated Gemini API key
        const apiKey = keyManager.getNextKey('GEMINI');
        if (!apiKey) {
            throw new Error("No Gemini API keys configured");
        }

        const systemPrompt = `
        You are an intelligent and helpful teaching assistant for a learning platform called RankUp.
        
        STRICT RULES:
        1. You must ONLY answer questions related to the "Lesson Content" provided below, or general questions about learning/education on RankUp.
        2. If the user asks about anything unrelated (e.g., movies, politics, personal advice, coding unsupported languages, unrelated trivia), you must politely decline.
        3. Say something like: "I am here to help you with this lesson. Please ask me about the topic!" or "That is outside of my training for this lesson."
        4. Do NOT pretend to know things outside of the educational context.
        5. Keep your answers relatively short (under 3-4 sentences) so they are easy to listen to.
        6. Be encouraging and positive, but stay on topic.

        Lesson Content:
        ${context || "No specific lesson content provided."}
        `;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt,
            generationConfig: {
                maxOutputTokens: 250,
                temperature: 0.7,
            }
        });

        // Prepare chat history for Gemini SDK
        const history = (chatHistory || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history: history
        });

        console.log("Sending message to Gemini SDK...");
        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        console.log("AI Response generated:", responseText);
        res.json({ response: responseText });

    } catch (err) {
        console.error("AI Chat Error Details:", err);
        res.status(500).json({ message: "Failed to generate AI response: " + err.message });
    }
};

export const getCareerAdvice = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("Career Advice Requested for:", userId);

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Find user — accept Firebase UID, email, or MongoDB ObjectId
        const user = await User.findOne({ uid: userId }) ||
            await User.findOne({ email: userId }) ||
            (userId.match(/^[0-9a-fA-F]{24}$/) ? await User.findById(userId) : null);

        if (!user) {
            console.error("User not found for Career Advice:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Found User:", user.username, user._id);

        // Fetch DSA Progress
        const dsaProgress = await UserDsaProgress.findOne({ userId: user._id });
        console.log("DSA Progress:", dsaProgress ? "Found" : "Not Found");

        // Fetch completed levels with module details
        const completedLevelsWithDetails = await Promise.all(
            (user.completedLevels || []).map(async (cl) => {
                try {
                    const level = await Level.findById(cl.levelId).populate('moduleId');
                    return {
                        title: level?.title || "Unknown Level",
                        module: level?.moduleId?.name || "Uncategorized",
                        score: cl.quizScore || 0
                    };
                } catch {
                    return { title: "Unknown Level", module: "Uncategorized", score: 0 };
                }
            })
        );

        // Group levels by module for a cleaner AI summary
        const moduleProgress = completedLevelsWithDetails.reduce((acc, lvl) => {
            acc[lvl.module] = (acc[lvl.module] || 0) + 1;
            return acc;
        }, {});

        const dsaInfo = dsaProgress ? {
            totalChallengesCompleted: dsaProgress.totalChallengesCompleted,
            currentStreak: dsaProgress.currentStreak,
            longestStreak: dsaProgress.longestStreak,
            totalXPEarned: dsaProgress.totalXPEarned,
            hasStarted: dsaProgress.hasStarted
        } : { hasStarted: false };

        const apiKey = keyManager.getNextKey('GEMINI');
        if (!apiKey) {
            throw new Error("No Gemini API keys configured");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `
You are "RankUp Career Agent" — a sharp, encouraging, and highly specific AI career mentor for students on the RankUp learning platform.

STUDENT PROFILE:
- Name: ${user.username || "Student"}
- Total Score: ${user.totalScore || 0}
- Levels Completed: ${user.completedLevels?.length || 0}
- Module Progress: ${JSON.stringify(moduleProgress)}
- Solved Problems: ${user.solvedProblemsCount || 0} / Attempted: ${user.attemptedProblemsCount || 0}
- DSA Progress: ${JSON.stringify(dsaInfo)}

YOUR TASK:
Analyze this student's learning profile and produce a concise, actionable, and motivating career guidance report.

STRUCTURE YOUR RESPONSE WITH THESE SECTIONS (use Markdown):

### 🎯 Where You Stand
A 2–3 sentence honest assessment of their current level.

### 🚀 Immediate Next Steps (This Week)
Bullet list of 2–3 specific, actionable tasks they can do right now on RankUp.

### 📈 30-Day Growth Plan
A short roadmap — what modules/topics to focus on and in what order.

### 💼 Career Path Suggestion
Based on their progress, suggest 1–2 career paths (e.g. Frontend Dev, Backend Dev, Data Structures & Algorithms specialist, Full Stack) and what skills they need to get there.

### ⚡ Quick Wins
2 things they can do today to boost their score or streak.

RULES:
- Be specific to their actual data — don't give generic advice.
- If DSA not started, make it the top priority.
- If score is 0 and no levels completed, guide them to start the basics.
- If doing well, challenge them with advanced goals.
- Keep each section tight and punchy — total response under 350 words.
- Use emojis sparingly for headers only.
`,
        });

        console.log("Generating AI career advice...");
        const prompt = `Generate my personalized career guidance report based on my RankUp profile.`;

        const result = await model.generateContent(prompt);
        const advice = result.response.text();

        console.log("Career advice generated successfully");
        res.json({
            advice,
            summary: {
                totalScore: user.totalScore || 0,
                dsaCompleted: dsaProgress?.totalChallengesCompleted || 0,
                currentStreak: dsaProgress?.currentStreak || 0,
                levelsCompleted: user.completedLevels?.length || 0
            }
        });

    } catch (err) {
        console.error("Career Advice Error Details:", err);
        res.status(500).json({ message: "Failed to generate career advice: " + err.message });
    }
};

export const careerFollowup = async (req, res) => {
    try {
        const { userId, question, previousAdvice } = req.body;

        if (!userId || !question) {
            return res.status(400).json({ message: "userId and question are required" });
        }

        const user = await User.findOne({ uid: userId }) ||
            await User.findOne({ email: userId }) ||
            (userId.match(/^[0-9a-fA-F]{24}$/) ? await User.findById(userId) : null);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const apiKey = keyManager.getNextKey('GEMINI');
        if (!apiKey) {
            throw new Error("No Gemini API keys configured");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `
You are "RankUp Career Agent" — an expert AI career mentor for students on the RankUp learning platform.

The student has already received this career advice:
---
${previousAdvice || "No prior advice available."}
---

Answer the student's follow-up question in a focused, helpful, and encouraging way.
- Be specific and actionable.
- Keep your response under 150 words unless the question requires more depth.
- Use Markdown for formatting if helpful.
- Stay relevant to their learning journey on RankUp.
`,
        });

        const result = await model.generateContent(question);
        const answer = result.response.text();

        res.json({ answer });

    } catch (err) {
        console.error("Career Followup Error:", err);
        res.status(500).json({ message: "Failed to answer follow-up: " + err.message });
    }
};
