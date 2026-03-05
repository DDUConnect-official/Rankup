import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import keyManager from "../utils/keyManager.js";

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
