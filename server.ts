require('dotenv').config();

import { app } from './app';  // Assuming app.ts is in the same directory
import connectDB from './utils/db';
import { v2 as cloudinary } from 'cloudinary';

// CLOUDINARY CONFIG
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.CLOUD_API_KEY as string,
    api_secret: process.env.CLOUD_SECRET_KEY as string,
});

// Export the app as the handler for Vercel (serverless)
module.exports = app;

// Optional: Connect to DB on module load (but prefer per-request in production)
connectDB().catch(console.error);