import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log(`Checking models with key: ${API_KEY ? 'Present' : 'Missing'}...`);

async function listModels() {
    try {
        const response = await fetch(URL);
        const data = await response.json();

        if (data.error) {
            console.error('API Error:', data.error);
        } else {
            console.log('Available Models:');
            if (data.models) {
                data.models.forEach(m => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                        console.log(`- ${m.name}`);
                    }
                });
            } else {
                console.log('No models found in response:', data);
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

listModels();
