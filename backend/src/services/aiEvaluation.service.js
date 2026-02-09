import { GoogleGenerativeAI } from "@google/generative-ai";

// Parse API keys from environment
const getApiKeys = () => {
    const keysString = process.env.GEMINI_KEYS || process.env.GEMINI_API_KEY;
    if (!keysString) {
        throw new Error("No Gemini API keys found in environment");
    }
    return keysString.split(',').map(key => key.trim()).filter(key => key.length > 0);
};

const API_KEYS = getApiKeys();
let currentKeyIndex = 0;

// Get the next API key in rotation
const getNextApiKey = () => {
    const key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
};

// Reset to first key
const resetKeyRotation = () => {
    currentKeyIndex = 0;
};

export const evaluateCode = async (challenge, code, explanation, language, isCompile = false) => {
    let lastError = null;
    const maxRetries = API_KEYS.length; // Try all available keys

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const apiKey = getNextApiKey();
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            let prompt = "";

            if (isCompile) {
                prompt = `You are a ${language} compiler and interpreter. Analyze and execute this code.

                **Code:**
                \`\`\`${language}
                ${code}
                \`\`\`

                RULES:
                - If there are SYNTAX ERRORS: List each error as a STRING in "syntaxErrors" array (format: "Line X: error description")
                - If NO syntax errors: Execute the code mentally and return the output in "output" field
                - "syntaxErrors" must ALWAYS be an array of STRINGS, never objects
                - "output" should contain what the code would print/return (e.g., "42", "undefined", "Hello World")
                - If code has no output, use "undefined" or "No output"
                - DO NOT give explanations or suggestions
                - Be a compiler, not a mentor

                Return ONLY valid JSON:
                {
                  "syntaxErrors": [],
                  "output": "result of code execution",
                  "feedback": "Compilation successful",
                  "totalScore": 0,
                  "syntaxScore": 0,
                  "logicScore": 0,
                  "qualityScore": 0,
                  "efficiencyScore": 0
                }`;
            } else {
                prompt = `You are a professional code reviewer and DSA mentor. 
                Evaluate the following code submission AND the user's logic explanation for a DSA challenge.

                **Challenge:** ${challenge.title}
                **Description:** ${challenge.description}
                **Difficulty:** ${challenge.difficulty}
                **Language:** ${language}

                **User's Code:**
                \`\`\`${language}
                ${code}
                \`\`\`

                **User's Logic Explanation:**
                "${explanation}"

                **Test Cases:**
                ${challenge.testCases?.map((tc, i) => `Test ${i + 1}: Input: ${tc.input}, Expected: ${tc.expectedOutput}`).join('\n') || "Test against provided examples."}

                Evaluate based on (Total 100 points):
                1. **Logic & Correctness (40 points)**: Does the code solve the problem? (Test against examples)
                2. **Explanation Quality (20 points)**: Does the user explain their logic correctly and clearly?
                3. **Code Quality (20 points)**: Variable naming, structure, readability.
                4. **Efficiency (20 points)**: Time and Space complexity.

                Return ONLY a valid JSON object:
                {
                  "syntaxScore": 0-20,
                  "logicScore": 0-40,
                  "qualityScore": 0-20,
                  "efficiencyScore": 0-20,
                  "totalScore": 0-100,
                  "feedback": "detailed feedback on code and explanation",
                  "syntaxErrors": []
                }`;
            }

            const result = await model.generateContent(prompt);
            const responseText = result.response.text().trim();

            const cleanedText = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            const evaluation = JSON.parse(cleanedText);

            // Success! Reset key rotation for next time
            if (attempt > 0) {
                console.log(`Successfully used API key #${currentKeyIndex} after ${attempt} failed attempts`);
            }

            // Ensure syntaxErrors is always an array of strings (not objects)
            const syntaxErrors = (evaluation.syntaxErrors || []).map(err =>
                typeof err === 'string' ? err : (err.message || JSON.stringify(err))
            );

            return {
                syntaxScore: evaluation.syntaxScore || 0,
                logicScore: evaluation.logicScore || 0,
                qualityScore: evaluation.qualityScore || 0,
                efficiencyScore: evaluation.efficiencyScore || 0,
                totalScore: evaluation.totalScore || 0,
                feedback: evaluation.feedback || (isCompile ? "Checks completed." : "Evaluation completed."),
                output: evaluation.output || null,
                syntaxErrors
            };
        } catch (error) {
            lastError = error;

            // Check if it's a quota error
            const isQuotaError = error.message && (
                error.message.includes('quota') ||
                error.message.includes('429') ||
                error.message.includes('Too Many Requests')
            );

            if (isQuotaError) {
                console.log(`API key #${currentKeyIndex} quota exceeded, trying next key... (attempt ${attempt + 1}/${maxRetries})`);
                continue; // Try next key
            } else {
                // Non-quota error, don't retry
                console.error("AI Evaluation Error (non-quota):", error.message);
                break;
            }
        }
    }

    // All keys failed
    console.error("AI Evaluation Error - All API keys exhausted:", lastError?.message);

    return {
        error: true,
        syntaxScore: 0,
        logicScore: 0,
        qualityScore: 0,
        efficiencyScore: 0,
        totalScore: 0,
        feedback: lastError?.message?.includes('quota')
            ? "All API keys have exceeded their quota. Please try again later or add more API keys."
            : `AI Evaluation service error: ${lastError?.message || 'Unknown error'}`,
        syntaxErrors: [lastError?.message?.includes('quota')
            ? "Quota exceeded on all API keys"
            : `Service Error: ${lastError?.message || 'Connection failed'}`]
    };
};
