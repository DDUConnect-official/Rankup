import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import studentRoutes from "./routes/student.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import Module from "./models/Module.js";

dotenv.config();

const seedModules = async () => {
    const modules = ["JavaScript", "Python", "HTML/CSS"];
    for (const name of modules) {
        await Module.findOneAndUpdate(
            { name },
            { name, icon: name.toLowerCase(), order: modules.indexOf(name) },
            { upsert: true, new: true }
        );
    }
    console.log("Modules seeded/verified ✅");
};

connectDB().then(() => {
    seedModules();
});
const app = express();

app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        "https://rankup-admin-eight.vercel.app",
        "http://192.168.1.142:5173",
        "http://localhost:5174", // Standard for second vite app
        "http://localhost:5173"
    ],
    credentials: true
}));

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
    res.send("RankUp Backend Running 🚀");
});

app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
