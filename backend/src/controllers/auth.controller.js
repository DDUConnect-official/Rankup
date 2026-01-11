import axios from "axios";

export const verifyCaptcha = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, message: "Token is required" });
    }

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
        );

        if (response.data.success) {
            // For reCAPTCHA v3, we also check the score
            // Score ranges from 0.0 (bot) to 1.0 (human). 0.5 is the default threshold.
            if (response.data.score !== undefined && response.data.score < 0.5) {
                return res.status(400).json({ success: false, message: "Bot activity detected (low score)", score: response.data.score });
            }

            return res.status(200).json({ success: true, message: "Captcha verified" });
        } else {
            return res.status(400).json({ success: false, message: "Captcha verification failed" });
        }
    } catch (error) {
        console.error("reCAPTCHA verification error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
