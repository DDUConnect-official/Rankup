import mongoose from "mongoose";
import dotenv from "dotenv";
import Module from "../src/models/Module.js";
import Level from "../src/models/Level.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const seedLevel = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // 1. Find or Create 'Maths' Module
        let mathsModule = await Module.findOne({ name: "Maths" });
        if (!mathsModule) {
            console.log("Maths module not found, creating...");
            mathsModule = new Module({ name: "Maths", icon: "📐", order: 1 });
            await mathsModule.save();
        }
        console.log(`Using Module: ${mathsModule.name} (${mathsModule._id})`);

        // 2. Define Level Content
        const levelData = {
            moduleId: mathsModule._id,
            title: "Integers",
            description: "The Complete Number Line: Understanding negative and positive numbers.",
            xpReward: 100,
            isPublished: true,
            theory: [
                {
                    type: "paragraph",
                    content: "**What are Integers?**\nIntegers include **all negative numbers, zero, and positive numbers**: ...-4, -3, -2, -1, 0, 1, 2, 3, 4... Unlike natural and whole numbers that only go right on the number line, integers cover **both directions**."
                },
                {
                    type: "paragraph",
                    content: "**Number Line - Both Directions Now:**\nZero sits perfectly in the middle as the balancing point. Negative numbers go **left** (smaller values), and positive numbers go **right** (larger values)."
                },
                {
                    type: "paragraph",
                    content: "**Real Life Examples:**"
                },
                {
                    type: "bullet",
                    content: "**Bank Account:** Start with +₹2000 deposit, spend -₹800 = +₹1200 remaining."
                },
                {
                    type: "bullet",
                    content: "**Temperature:** -5°C feels freezing cold, +35°C feels hot."
                },
                {
                    type: "bullet",
                    content: "**Building Floors:** -1 is basement, 0 is ground, +5 is fifth floor."
                },
                {
                    type: "bullet",
                    content: "**Game Health:** +100 HP full health, -20 HP damage taken."
                },
                {
                    type: "paragraph",
                    content: "**Opposite Numbers - Perfect Pairs:**\nEvery positive integer has a **negative counterpart** that cancels it to zero (e.g., +5 and -5). These are called **additive inverses**."
                },
                {
                    type: "paragraph",
                    content: "**Ordering:**\nIntegers increase from left to right: -8 < -3 < 0 < 2 < 15. The number line never has gaps between integers."
                },
                {
                    type: "paragraph",
                    content: "**Practical Applications:**"
                },
                {
                    type: "bullet",
                    content: "**Profit/Loss:** +₹500 profit, -₹200 loss."
                },
                {
                    type: "bullet",
                    content: "**Stock Market:** +10 points gain, -7 points drop."
                },
                {
                    type: "bullet",
                    content: "**Elevator:** -2 floors down, +4 floors up."
                },
                {
                    type: "paragraph",
                    content: "**Subtraction as Addition:**\nSubtracting integers is the same as adding the opposite: 7 - 4 becomes 7 + (-4) = 3. This makes calculations consistent."
                }
            ]
        };

        // 3. Create or Update Level
        // Check if exists by title to avoid duplicates
        const existingLevel = await Level.findOne({ moduleId: mathsModule._id, title: "Integers" });
        if (existingLevel) {
            console.log("Level 'Integers' already exists. Updating...");
            Object.assign(existingLevel, levelData);
            await existingLevel.save();
        } else {
            const newLevel = new Level(levelData);
            await newLevel.save();
            console.log("Created new 'Integers' level.");
        }

        console.log("🎉 Level added successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding level:", error);
        process.exit(1);
    }
};

seedLevel();
