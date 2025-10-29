import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import userModel from "../models/userModel";
import courseModel, { ICourse } from "../models/courseModel";
import { getAllOrdersService, newOrder } from "../services/orderService";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import notificationModel from "../models/notificationModel";
import orderModel, { IOrder } from "../models/orderModel";
import { redis } from "../utils/redis";
import { stringify } from "querystring";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// CREATE A ORDER
export const createOrder = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { courseId, payment_info } = req.body as IOrder;
            if (payment_info) {
                if ('id' in payment_info) {
                    const paymentIntentId = payment_info.id;
                    const paymentIntent = await stripe.paymentIntents.retrieve(
                        paymentIntentId
                    )
                    if (paymentIntent.status !== 'succeeded') {
                        return next(new ErrorHandler('Payment not authorized!', 400))
                    }
                }
            }
            const user = await userModel.findById(req.user?._id);

            const courseExistInUser = user?.courses.some(
                (course: any) => course._id.toString() === courseId.toString()
            );
            if (courseExistInUser) {
                return next(
                    new ErrorHandler("You have already purchased this course", 400)
                );
            }

            const course: ICourse | null = await courseModel.findById(courseId);
            if (!course) {
                return next(new ErrorHandler("Course not found", 404));
            }

            // // Add course to user's courses and save first


            // Create order after updating user
            const data: any = { courseId: course._id, userId: user?._id, payment_info };

            // Prepare and send email
            const mailData = {
                order: {
                    _id: course._id,
                    name: course.name,
                    price: course.price,
                    date: new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    }),
                },
            };

            const html = await ejs.renderFile(
                path.join(__dirname, "../mails/order-confirmation.ejs"),
                { order: mailData }
            );

            try {
                if (user) {
                    await sendMail({
                        email: user.email,
                        subject: "Order Confirmation",
                        template: "order-confirmation.ejs",
                        data: mailData,
                    });
                }
            } catch (error: any) {
                return next(new ErrorHandler(`Failed to send email: ${error.message}`, 500));
            }

            user?.courses.push(course?.id);
            await user?.save();

            // Create notification
            await notificationModel.create({
                user: user?._id,
                title: "New Order",
                message: `You have a new order from ${course.name}`,
            });


            course.purchased = course.purchased + 1

            await redis.set(JSON.stringify(req.user?._id), JSON.stringify(user))
            await course.save()

            newOrder(data, res, next);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);
// GET ALL ORDERS FOR ---ADMIN
export const getAllOrders = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        getAllOrdersService(res)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})
// SEND STRIPE PUBLISH KEY

export const sendStripePublishKey = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({
            success: true,
            stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// NEW PAYMENT

export const newPayment = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const myPayment = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "usd",
            metadata: {
                company: 'E-Learning'
            },
            automatic_payment_methods: {
                enabled: true
            }
        });
        res.status(201).json({
            success: true,
            client_secret: myPayment.client_secret
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
}) 
