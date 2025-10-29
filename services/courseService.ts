
import { Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import courseModel from "../models/courseModel";

export const createCourse = CatchAsyncError(async (data: any, res: Response) => {
    const course = await courseModel.create(data)

    res.status(201).json({
        success: true,
        course
    })
})

// GET ALL COURSES
export const getAllCoursesService = async (res: Response) => {
    const courses = await courseModel.find().sort({ createdAt: -1 })
    res.status(200).json({
        success: true,
        courses
    })
}