import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { generataLast12MonthData } from "../utils/analytics-generater";
import userModel from "../models/userModel";
import courseModel from "../models/courseModel";
import orderModel from "../models/orderModel";


// GET USER ANALYTICS  ---ADMIN
export const getUsersAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await generataLast12MonthData(userModel)
        res.status(200).json({
            success: true,
            users
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }


})

// GET COURSES ANALYTICS  ---ADMIN
export const getCoursesAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await generataLast12MonthData(courseModel)
        res.status(200).json({
            success: true,
            courses
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }


})

// GET COURSES ANALYTICS  ---ADMIN
export const getOrdersAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await generataLast12MonthData(orderModel)
        res.status(200).json({
            success: true,
            orders
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }


})
