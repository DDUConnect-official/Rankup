import User from "../models/User.js";

export const isAdmin = async (req, res, next) => {
    const { email } = req.headers; // Temporary until full auth integration

    if (!email) {
        return res.status(401).json({ message: "Unauthorized: No email provided in headers" });
    }

    try {
        const user = await User.findOne({ email });
        if (user && user.role === "admin") {
            next();
        } else {
            res.status(403).json({ message: "Forbidden: Admin access required" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error during authorization" });
    }
};
