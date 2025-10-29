"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./middleware/error");
const userRout_1 = __importDefault(require("./routes/userRout"));
const courseRout_1 = __importDefault(require("./routes/courseRout"));
const orderRout_1 = __importDefault(require("./routes/orderRout"));
const notificationRout_1 = __importDefault(require("./routes/notificationRout"));
const analyticsRout_1 = __importDefault(require("./routes/analyticsRout"));
const layoutRout_1 = __importDefault(require("./routes/layoutRout"));
exports.app = (0, express_1.default)();
const { rateLimit } = require('express-rate-limit');
// BODY PARSER
exports.app.use(express_1.default.json({ limit: "50mb" }));
// COOKIE PARSER
exports.app.use((0, cookie_parser_1.default)());
// CORS  =>  CORS ORIGIN RECOURSES SHARING
exports.app.use((0, cors_1.default)({
    origin: ['https://lms-client-theta-black.vercel.app'],
    credentials: true
}));
// SET API LIMIT 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeader: 'draft-7',
    legacyHeaders: false
});
// ROUTES
exports.app.use('/api/v1', userRout_1.default);
exports.app.use('/api/v1', courseRout_1.default);
exports.app.use('/api/v1', orderRout_1.default);
exports.app.use('/api/v1', notificationRout_1.default);
exports.app.use('/api/v1', analyticsRout_1.default);
exports.app.use('/api/v1', layoutRout_1.default);
// TESTING API
exports.app.get('/test', (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Api is working successfully"
    });
});
exports.app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the LMS API. Use /api/v1 for API endpoints or /test for a test route.'
    });
});
exports.app.use(limiter);
exports.app.use(error_1.ErrorMiddleware);
//# sourceMappingURL=app.js.map