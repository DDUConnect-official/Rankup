import mongoose from "mongoose";
import dotenv from "dotenv";
import Module from "../src/models/Module.js";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from ../.env
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const cleanupOldModules = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Remove old modules that shouldn't exist
        const modulesToRemove = ["Maths", "Science", "Coding"];

        for (const moduleName of modulesToRemove) {
            const result = await Module.deleteMany({ name: moduleName });
            if (result.deletedCount > 0) {
                console.log(`🗑️  Deleted ${result.deletedCount} "${moduleName}" module(s)`);
            } else {
                console.log(`ℹ️  No "${moduleName}" modules found`);
            }
        }

        console.log("✨ Cleanup completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Cleanup failed:", error);
        process.exit(1);
    }
};

cleanupOldModules();
