import mongoose from "mongoose";
import dotenv from "dotenv";
import Module from "../src/models/Module.js";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from ../.env
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const seedModules = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing modules just in case (though user said they did)
        // Actually, let's just use upsert to be safe and idempotent
        const modulesToSeed = [
            {
                name: "JavaScript",
                icon: "js-icon", // Placeholder, frontend seems to handle icons based on name
                order: 1,
            },
            {
                name: "Python",
                icon: "python-icon",
                order: 2,
            },
            {
                name: "HTML/CSS",
                icon: "html-icon",
                order: 3,
            },
        ];

        console.log("Starting seed process...");

        for (const mod of modulesToSeed) {
            await Module.findOneAndUpdate(
                { name: mod.name },
                mod,
                { upsert: true, new: true, runValidators: true }
            );
            console.log(`Created/Updated module: ${mod.name}`);
        }

        // Optional: Check if there are any modules that shouldn't be there (e.g. Maths, Science) and warn or remove
        // Given user instructions, we assume manual cleanup was done, or we ignore old ones.

        console.log("✨ Modules seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedModules();
