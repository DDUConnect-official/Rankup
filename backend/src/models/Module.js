import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
    name: { type: String, required: true, enum: ["JavaScript", "Python", "HTML/CSS"] },
    icon: { type: String },
    order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Module", moduleSchema);
