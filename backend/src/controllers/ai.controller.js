
import dotenv from "dotenv";

dotenv.config();

export const chatWithAI = async (req, res) => {
    try {
        console.log("AI Chat Request received:", req.body);
        const { message, previousMessages, context } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        // Construct history (simple version)
        let history = "";
        if (previousMessages && Array.isArray(previousMessages)) {
             history = previousMessages.map(msg => 
                `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
             ).join("\n");
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

        const fullPrompt = `${systemPrompt}\n\nConversation History:\n${history}\n\nUser: ${message}\nAssistant:`;

        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        console.log("Sending request to Gemini via fetch...");
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", response.status, errorText);
            throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("Gemini API Data:", JSON.stringify(data).substring(0, 100) + "...");

        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!responseText) {
             throw new Error("No text found in Gemini response");
        }

        console.log("AI Response generated:", responseText);
        res.json({ response: responseText });

    } catch (err) {
        console.error("AI Chat Error Details:", err);
        res.status(500).json({ message: "Failed to generate AI response: " + err.message });
    }
};
