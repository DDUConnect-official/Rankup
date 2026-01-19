import User from "../models/User.js";

export const isAdmin = async (req, res, next) => {
    try {
        const uid = req.headers["x-user-id"];
        if (!uid) {
            return res.status(401).json({ message: "Unauthorized: No User ID provided" });
        }

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admin access only" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Admin Auth Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
