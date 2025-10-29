import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import orderModel from "../models/orderModel";


// CREATE A NEW ORDER
export const newOrder = CatchAsyncError(async (data: any, res: Response) => {

    const order = await orderModel.create(data)
    res.status(201).json({
        success: true,
        order
    });

})

//  GET ALL ORDERS ---ADMIN
export const getAllOrdersService = async (res: Response) => {
    const orders = await orderModel.find().sort({ createdAt: -1 })
    res.status(201).json({
        success: true,
        orders
    })
}