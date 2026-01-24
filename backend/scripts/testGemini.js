import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // For listing models, we can't easily do it with the high-level SDK unless we use the model manager?
        // Actually, simply trying to generate content with a fallback model is better.

        console.log("Testing Gemini API...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello?");
        const response = await result.response;
        console.log("Response:", response.text());
    } catch (err) {
        console.error("Error:", err);
    }
};
run();
