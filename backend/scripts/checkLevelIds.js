import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Level from '../src/models/Level.js';

dotenv.config();

const listLevels = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const levels = await Level.find();
        console.log('Current Levels in DB:');
        levels.forEach(l => {
            console.log(`- ID: ${l._id}, Title: ${l.title}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listLevels();
