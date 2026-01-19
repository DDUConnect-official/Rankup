import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import connectDB from "../src/config/db.js";

dotenv.config();

const seedAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error("Please provide an email address as an argument.");
        process.exit(1);
    }

    try {
        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = "admin";
        await user.save();

        console.log(`Successfully updated ${email} to admin.`);
        process.exit(0);
    } catch (error) {
        console.error("Error updating user:", error);
        process.exit(1);
    }
};

seedAdmin();
