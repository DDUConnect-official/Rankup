import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

connectDB();
const app = express();

app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        "http://192.168.1.142:5173"
    ],
    credentials: true
}));

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("RankUp Backend Running 🚀");
});

app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
