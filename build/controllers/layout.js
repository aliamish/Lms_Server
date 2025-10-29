"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutByType = exports.editLayout = exports.createLayout = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const layoutModel_1 = __importDefault(require("../models/layoutModel"));
const cloudinary_1 = __importDefault(require("cloudinary"));
// CREATE A LAYOUT  ---ADMIN
exports.createLayout = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { type } = req.body;
        const isTypeExists = await layoutModel_1.default.findOne({ type });
        if (isTypeExists) {
            return next(new ErrorHandler_1.default(`${type} already exists`, 400));
        }
        // WILL TEST AFTER BECOMING FRONTEND
        if (type === 'Banner') {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary_1.default.v2.uploader.upload(image, { folder: 'layout' });
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
            };
            await layoutModel_1.default.create(banner);
        }
        if (type === 'Faq') {
            const { faq } = req.body;
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answer: item.answer
                };
            }));
            await layoutModel_1.default.create({ type: 'Faq', faq: faqItems });
        }
        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesItems = await Promise.all(categories.map(async (item) => {
                return {
                    title: item.title
                };
            }));
            await layoutModel_1.default.create({ type: 'Categories', categories: categoriesItems });
        }
        res.status(200).json({
            success: true,
            message: 'Layout created successfully'
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// EDIT A LAYOUT   ---ADMIN
exports.editLayout = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { type } = req.body;
        // WILL TEST AFTER BECOMING FRONTEND
        if (type === 'Banner') {
            const bannerData = await layoutModel_1.default.findOne({ type: 'Banner' });
            const { image, title, subTitle } = req.body;
            const data = image.startsWith('https') ? bannerData : await cloudinary_1.default.v2.uploader.upload(image, {
                folder: 'layout'
            });
            const banner = {
                type: "Banner",
                image: {
                    public_id: image.startsWith('https') ? bannerData.banner.image.public_id : data.public_id,
                    url: image.startsWith('https') ? bannerData.banner.image.url : data.secure_url
                },
                title,
                subTitle
            };
            await layoutModel_1.default.findByIdAndUpdate(bannerData.id, { banner });
        }
        if (type === 'Faq') {
            const { faq } = req.body;
            const FaqItem = await layoutModel_1.default.findOne({ type: 'Faq' });
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answer: item.answer
                };
            }));
            await layoutModel_1.default.findByIdAndUpdate(FaqItem?._id, { type: 'Faq', faq: faqItems });
        }
        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesData = await layoutModel_1.default.findOne({ type: 'Categories' });
            const categoriesItems = await Promise.all(categories.map(async (item) => {
                return {
                    title: item.title
                };
            }));
            await layoutModel_1.default.findByIdAndUpdate(categoriesData?._id, { type: 'Categories', categories: categoriesItems });
        }
        res.status(200).json({
            success: true,
            message: 'Layout updated successfully'
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// GET LAYOUT BY TYPE   --ADMIN
exports.getLayoutByType = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { type } = req.params;
        const layout = await layoutModel_1.default.findOne({ type });
        res.status(201).json({
            success: true,
            layout
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//# sourceMappingURL=layout.js.map