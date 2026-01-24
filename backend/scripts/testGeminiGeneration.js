import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        console.log("Testing Quiz Generation with gemini-flash-latest...");

        const prompt = `Generate 2 multiple-choice questions about "Integers".
Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A"
  }
]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Raw Response Text:");
        console.log("---------------------------------------------------");
        console.log(text);
        console.log("---------------------------------------------------");

        try {
            // Attempt to clean and parse
            const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const questions = JSON.parse(cleanedText);
            console.log("Successfully Parsed JSON:", questions);
        } catch (parseError) {
            console.error("JSON Parsing Failed:", parseError.message);
        }

    } catch (err) {
        console.error("API Error Details:", err);
    }
};
run();
