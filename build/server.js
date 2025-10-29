"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const app_1 = require("./app"); // Assuming app.ts is in the same directory
const db_1 = __importDefault(require("./utils/db"));
const cloudinary_1 = require("cloudinary");
// CLOUDINARY CONFIG
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
});
// Export the app as the handler for Vercel (serverless)
module.exports = app_1.app;
// Optional: Connect to DB on module load (but prefer per-request in production)
(0, db_1.default)().catch(console.error);
//# sourceMappingURL=server.js.map