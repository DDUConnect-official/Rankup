
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

// Suppress logs workaround or just verify env manually
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log("CHECKING MODELS...");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await axios.get(url);
        
        const names = response.data.models.map(m => m.name);
        fs.writeFileSync('models.json', JSON.stringify(names, null, 2));
        console.log("✅ Models written to models.json");

    } catch (error) {
        console.error("❌ ERROR:", error.message);
    }
}

listModels();
