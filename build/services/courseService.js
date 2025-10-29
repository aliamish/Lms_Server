"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCoursesService = exports.createCourse = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const courseModel_1 = __importDefault(require("../models/courseModel"));
exports.createCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (data, res) => {
    const course = await courseModel_1.default.create(data);
    res.status(201).json({
        success: true,
        course
    });
});
// GET ALL COURSES
const getAllCoursesService = async (res) => {
    const courses = await courseModel_1.default.find().sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        courses
    });
};
exports.getAllCoursesService = getAllCoursesService;
//# sourceMappingURL=courseService.js.map