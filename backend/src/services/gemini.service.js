import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate quiz questions from level content using Gemini AI
 * @param {Array<string>} contentArray - Array of paragraph strings
 * @param {number} questionCount - Number of questions to generate (default: 5)
 * @returns {Promise<Array>} Generated quiz questions
 */
export const generateQuiz = async (contentArray, questionCount = 5) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Combine content into single text
        const contentText = contentArray.join('\n\n');

        // Create prompt for Gemini
        const prompt = `Based on the following educational content, generate ${questionCount} multiple-choice quiz questions. 

Content:
${contentText}

Requirements:
- Each question should test understanding of key concepts
- Provide exactly 4 options for each question
- Mark the correct answer clearly
- Questions should be progressive (easy to moderate difficulty)
- Avoid trick questions
- Focus on conceptual understanding

Return ONLY a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "question": "Question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "The exact text of the correct option"
  }
]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse JSON response
        const questions = JSON.parse(text);

        // Validate response
        if (!Array.isArray(questions)) {
            throw new Error('Invalid response format from Gemini');
        }

        // Validate each question
        questions.forEach((q, idx) => {
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
                throw new Error(`Invalid question format at index ${idx}`);
            }
            // Ensure correctAnswer is one of the options
            if (!q.options.includes(q.correctAnswer)) {
                throw new Error(`Correct answer not found in options at index ${idx}`);
            }
        });

        return questions.slice(0, questionCount); // Return only requested count

    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(`Quiz generation failed: ${error.message}`);
    }
};
