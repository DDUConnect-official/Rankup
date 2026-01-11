import express from "express";
import User from "../models/User.js";

const router = express.Router();

// CHECK: Does the profile exist in MongoDB by Email?
router.get("/check-profile/:email", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (user) {
            return res.status(200).json({ exists: true, user });
        }
        res.status(200).json({ exists: false });
    } catch (error) {
        res.status(500).json({ message: "Server error checking profile" });
    }
});

// CHECK: Is the username available?
router.get("/check-username/:username", async (req, res) => {
    try {
        const username = req.params.username.replace(/\s+/g, ""); // Strip all spaces
        const user = await User.findOne({
            username: { $regex: new RegExp("^" + username + "$", "i") }
        });
        if (user) {
            return res.status(200).json({ available: false });
        }
        res.status(200).json({ available: true });
    } catch (error) {
        res.status(500).json({ message: "Error checking username" });
    }
});

// CREATE/UPDATE: Create the document only after Profile Setup is submitted
router.post("/setup-profile", async (req, res) => {
    const { uid, email, username, avatar, branch, university, languagePreference, aboutMe } = req.body;

    // Backend Validation
    if (!uid || !email || !username || !branch || !university || !aboutMe) {
        return res.status(400).json({ message: "Missing mandatory profile fields" });
    }

    try {
        const user = await User.findOneAndUpdate(
            { uid },
            {
                uid,
                email,
                username,
                avatar,
                branch,
                university,
                languagePreference,
                aboutMe,
                profileCompleted: true //
            },
            { upsert: true, new: true }
        );

        res.status(201).json(user); // Profile created successfully
    } catch (error) {
        res.status(500).json({ message: "Error saving profile data" });
    }
});

// DELETE: Delete user profile from MongoDB
router.delete("/delete-account/:uid", async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User profile deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user profile" });
    }
});

export default router;