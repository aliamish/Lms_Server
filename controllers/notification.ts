import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import notificationModel from "../models/notificationModel";
import ErrorHandler from "../utils/ErrorHandler";
import cron from 'node-cron'


// GET ALL NOTIFICATIONS --- ONLY ADMIN 
export const getNotification = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await notificationModel.find().sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            notifications
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// UPDATE NOTIFICATION STATUS ---ONLY ADMIN
export const updateNotification = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await notificationModel.findById(req.params.id)
        if (notification) {
            notification.status = 'read'
        }

        await notification?.save();

        const notifications = await notificationModel.find().sort({ createdAt: -1 })

        res.status(201).json({
            success: true,
            notifications
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// DELETE NOTIFICATION  ---ADMIN
cron.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await notificationModel.deleteMany({ status: 'read', createdAt: { $lt: thirtyDaysAgo } })
    console.log('Deleted read notification')
}) 