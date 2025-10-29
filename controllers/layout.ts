import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import layoutModel from "../models/layoutModel";
import cloudinary from 'cloudinary'



// CREATE A LAYOUT  ---ADMIN
export const createLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        const isTypeExists = await layoutModel.findOne({ type })
        if (isTypeExists) {
            return next(new ErrorHandler(`${type} already exists`, 400))
        }

        // WILL TEST AFTER BECOMING FRONTEND

        if (type === 'Banner') {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(image, { folder: 'layout' })

            const banner = {
                type: 'Banner',
                banner: {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url
                    },
                    title,
                    subTitle
                }
            }
            await layoutModel.create(banner)
        }

        if (type === 'Faq') {
            const { faq } = req.body
            const faqItems = await Promise.all(faq.map(async (item: any) => {
                return {
                    question: item.question,
                    answer: item.answer
                }
            }))
            await layoutModel.create({ type: 'Faq', faq: faqItems })
        }

        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesItems = await Promise.all(categories.map(async (item: any) => {
                return {
                    title: item.title
                }
            }))
            await layoutModel.create({ type: 'Categories', categories: categoriesItems })
        }

        res.status(200).json({
            success: true,
            message: 'Layout created successfully'
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// EDIT A LAYOUT   ---ADMIN
export const editLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;



        // WILL TEST AFTER BECOMING FRONTEND

        if (type === 'Banner') {
            const bannerData: any = await layoutModel.findOne({ type: 'Banner' })
            const { image, title, subTitle } = req.body;

            const data = image.startsWith('https') ? bannerData : await cloudinary.v2.uploader.upload(image, {
                folder: 'layout'
            })

            const banner = {
                type: "Banner",
                image: {
                    public_id: image.startsWith('https') ? bannerData.banner.image.public_id : data.public_id,
                    url: image.startsWith('https') ? bannerData.banner.image.url : data.secure_url
                },  
                title,
                subTitle
            }
            await layoutModel.findByIdAndUpdate(bannerData.id, { banner })
        }

        if (type === 'Faq') {
            const { faq } = req.body
            const FaqItem = await layoutModel.findOne({ type: 'Faq' })
            const faqItems = await Promise.all(faq.map(async (item: any) => {
                return {
                    question: item.question,
                    answer: item.answer
                }
            }))
            await layoutModel.findByIdAndUpdate(FaqItem?._id, { type: 'Faq', faq: faqItems })
        }

        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesData = await layoutModel.findOne({ type: 'Categories' })

            const categoriesItems = await Promise.all(categories.map(async (item: any) => {
                return {
                    title: item.title
                }
            }))
            await layoutModel.findByIdAndUpdate(categoriesData?._id, { type: 'Categories', categories: categoriesItems })
        }

        res.status(200).json({
            success: true,
            message: 'Layout updated successfully'
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// GET LAYOUT BY TYPE   --ADMIN

export const getLayoutByType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { type } = req.params
        const layout = await layoutModel.findOne({ type })

        res.status(201).json({
            success: true,
            layout
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

