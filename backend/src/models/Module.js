import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
    name: { type: String, required: true, enum: ["Maths", "Science", "Coding"] },
    icon: { type: String }, // URL or icon name
    order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Module", moduleSchema);
