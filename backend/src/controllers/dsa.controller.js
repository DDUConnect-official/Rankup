import DsaChallenge from "../models/DsaChallenge.js";
import DsaSubmission from "../models/DsaSubmission.js";
import UserDsaProgress from "../models/UserDsaProgress.js";
import User from "../models/User.js";
import { evaluateCode } from "../services/aiEvaluation.service.js";

// Get user's current challenge
export const getTodayChallenge = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Get or create user progress
        let progress = await UserDsaProgress.findOne({ userId });

        if (!progress) {
            progress = new UserDsaProgress({ userId, hasStarted: false });
            await progress.save();
        }

        // If not started, return start prompt
        if (!progress.hasStarted) {
            return res.json({
                hasStarted: false,
                message: "Start your 100 Days of DSA journey!"
            });
        }

        // Calculate current day based on start date
        const daysSinceStart = Math.floor((Date.now() - progress.startDate) / (1000 * 60 * 60 * 24));
        const currentDay = Math.min(daysSinceStart + 1, 100);

        // Get today's challenge
        const challenge = await DsaChallenge.findOne({ dayNumber: currentDay });

        if (!challenge) {
            return res.status(404).json({ error: "Challenge not found for this day" });
        }

        // Check if user has attempted today
        const submissions = await DsaSubmission.find({
            userId,
            challengeId: challenge._id
        }).sort({ createdAt: -1 });

        const hasAttempted = submissions.length > 0;
        const bestScore = hasAttempted ? Math.max(...submissions.map(s => s.score)) : null;

        res.json({
            hasStarted: true,
            currentDay,
            challenge: {
                _id: challenge._id,
                dayNumber: challenge.dayNumber,
                title: challenge.title,
                description: challenge.description,
                difficulty: challenge.difficulty,
                constraints: challenge.constraints,
                examples: challenge.examples,
                hints: challenge.hints,
                tags: challenge.tags,
                maxXP: challenge.maxXP
            },
            userStatus: {
                hasAttempted,
                bestScore,
                attemptsCount: submissions.length,
                lastSubmission: submissions[0] || null
            },
            progress: {
                currentStreak: progress.currentStreak,
                totalCompleted: progress.totalChallengesCompleted,
                totalXP: progress.totalXPEarned
            }
        });
    } catch (error) {
        console.error("Get Today Challenge Error:", error);
        res.status(500).json({ error: "Failed to fetch challenge" });
    }
};

// Start the challenge
export const startChallenge = async (req, res) => {
    try {
        const userId = req.params.userId;

        let progress = await UserDsaProgress.findOne({ userId });

        if (!progress) {
            progress = new UserDsaProgress({
                userId,
                hasStarted: true,
                startDate: new Date()
            });
        } else if (!progress.hasStarted) {
            progress.hasStarted = true;
            progress.startDate = new Date();
        } else {
            return res.status(400).json({ error: "Challenge already started" });
        }

        await progress.save();

        res.json({
            success: true,
            message: "100 Days of DSA challenge started!",
            startDate: progress.startDate
        });
    } catch (error) {
        console.error("Start Challenge Error:", error);
        res.status(500).json({ error: "Failed to start challenge" });
    }
};

// Submit or Compile code for evaluation
export const submitCode = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { challengeId, code, explanation, language, isCompile } = req.body;

        if (!code || !challengeId) {
            return res.status(400).json({ error: "Code and challenge ID required" });
        }

        // Get challenge
        const challenge = await DsaChallenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ error: "Challenge not found" });
        }

        // Evaluate code with AI
        const aiEvaluation = await evaluateCode(challenge, code, explanation, language, isCompile);

        // If it's just a compilation/test run, return AI results without saving or awarding XP
        if (isCompile) {
            return res.json({
                success: !aiEvaluation.error,
                isCompile: true,
                error: aiEvaluation.error || false,
                evaluation: aiEvaluation
            });
        }

        // --- FULL SUBMISSION LOGIC ---
        if (!explanation) {
            return res.status(400).json({ error: "Logic explanation is required for submission" });
        }

        // Check if first attempt
        const previousSubmissions = await DsaSubmission.find({ userId, challengeId });
        const isFirstAttempt = previousSubmissions.length === 0;

        // Calculate XP (only for first attempt)
        const xpAwarded = isFirstAttempt ? aiEvaluation.totalScore : 0;

        // Save submission
        const submission = new DsaSubmission({
            userId,
            challengeId,
            dayNumber: challenge.dayNumber,
            code,
            explanation,
            language,
            score: aiEvaluation.totalScore,
            xpAwarded,
            isFirstAttempt,
            aiEvaluation
        });
        await submission.save();

        // Update user progress
        const progress = await UserDsaProgress.findOne({ userId });

        if (aiEvaluation.totalScore >= 50) { // Consider completed if score >= 50
            if (isFirstAttempt) {
                progress.totalXPEarned += xpAwarded;

                if (!progress.firstAttemptDays.includes(challenge.dayNumber)) {
                    progress.firstAttemptDays.push(challenge.dayNumber);
                }

                // Update user's total XP
                await User.findByIdAndUpdate(userId, {
                    $inc: { xp: xpAwarded }
                });
            }

            if (!progress.completedDays.includes(challenge.dayNumber)) {
                progress.completedDays.push(challenge.dayNumber);
                progress.totalChallengesCompleted += 1;
            }

            // Update streak
            const today = new Date().setHours(0, 0, 0, 0);
            const lastCompleted = progress.lastCompletedDate ?
                new Date(progress.lastCompletedDate).setHours(0, 0, 0, 0) : null;

            if (!lastCompleted || today - lastCompleted === 86400000) { // 1 day
                progress.currentStreak += 1;
                progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
            } else if (today - lastCompleted > 86400000) {
                progress.currentStreak = 1;
            }

            progress.lastCompletedDate = new Date();
        }

        await progress.save();

        res.json({
            success: true,
            evaluation: aiEvaluation,
            xpAwarded,
            isFirstAttempt,
            progress: {
                currentStreak: progress.currentStreak,
                totalCompleted: progress.totalChallengesCompleted,
                totalXP: progress.totalXPEarned
            }
        });
    } catch (error) {
        console.error("Submit Code Error:", error);
        res.status(500).json({ error: "Failed to submit code" });
    }
};

// Get user's DSA progress
export const getProgress = async (req, res) => {
    try {
        const userId = req.params.userId;
        const progress = await UserDsaProgress.findOne({ userId });

        if (!progress) {
            return res.json({
                hasStarted: false,
                currentStreak: 0,
                totalCompleted: 0,
                totalXP: 0
            });
        }

        res.json(progress);
    } catch (error) {
        console.error("Get Progress Error:", error);
        res.status(500).json({ error: "Failed to fetch progress" });
    }
};
