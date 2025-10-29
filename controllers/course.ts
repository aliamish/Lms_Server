import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from 'cloudinary'
import { createCourse, getAllCoursesService } from "../services/courseService";
import courseModel from "../models/courseModel";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from 'ejs'
import sendMail from "../utils/sendMail";
import notificationModel from "../models/notificationModel";
import axios from 'axios'

// CREATE OR UPLOAD A COURSE
export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;

        // Only upload if thumbnail is a string
        if (thumbnail && typeof thumbnail === 'string') {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            };
        }

        // Call createCourse with updated data
        createCourse(data, res, next);

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// EDIT A COURSE
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail
        const courseId = req.params.id;

        const courseData = await courseModel.findById(courseId)

        if (thumbnail && !thumbnail.startsWith('https')) {
            // destroy previous image only if it exists
            if (courseData && courseData.thumbnail && (courseData.thumbnail as any).public_id) {
                await cloudinary.v2.uploader.destroy((courseData.thumbnail as any).public_id)
            }

            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            })
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        } else if (typeof thumbnail === 'string' && thumbnail.startsWith('https')) {
            // keep existing thumbnail values if available
            data.thumbnail = {
                public_id: courseData && courseData.thumbnail ? (courseData.thumbnail as any).public_id : undefined,
                url: courseData && courseData.thumbnail ? (courseData.thumbnail as any).url : thumbnail
            }
        }

        const course = await courseModel.findByIdAndUpdate(courseId, {
            $set: data
        }, { new: true })

        res.status(201).json({
            success: true,
            course
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// GET SINGLE COURSE ---WITHOUT PURCHASING
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const courseId = req.params.id as string
        const isCacheExist = await redis.get(courseId);

        if (isCacheExist) {
            const course = JSON.parse(isCacheExist)
            res.status(200).json({
                success: true,
                course
            })
        } else {

            const course = await courseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")



            await redis.set(courseId, JSON.stringify(course), 'EX', 604800)
            res.status(200).json({
                success: true,
                course
            })
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// GET ALL COURSES --- WITHOUT PURCHASING
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const courses = await courseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")

        await redis.set('allCourses', JSON.stringify(courses))
        res.status(200).json({
            success: true,
            courses
        })
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// GET COURSE CONTENT CONTENT  ---ONLY FOR VALID USER
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        const courseExists = userCourseList?.find((course: any) => course._id.toString() === courseId)

        if (!courseExists) {
            return next(new ErrorHandler('You are not eligible to access to this course.', 404))
        }

        const course = await courseModel.findById(courseId)
        const content = course?.courseData;

        res.status(200).json({
            success: true,
            content
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// ADD QUESTION IN COURSE
interface IQuestionData {
    question: String,
    courseId: String,
    contentId: String
}
export const addQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, courseId, contentId }: IQuestionData = req.body;
        const course = await courseModel.findById(courseId)
        if (!mongoose.Types.ObjectId.isValid(contentId as string)) {
            return next(new ErrorHandler('Invalid content id', 400))
        }

        const courseContent = course?.courseData.find((item: any) => item._id.equals(contentId))
        if (!courseContent) {
            return next(new ErrorHandler('Invalid content id', 400))
        }

        // CREATE A NEW QUESTION OBJECT
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: []
        }

        // ADD THE QUESTION TO OUR COURSE
        courseContent.questions.push(newQuestion)

        await notificationModel.create({
            user: req.user?._id,
            title: "New Question Receive",
            message: `You have a new question in ${courseContent.title}`,
        });
        // SAVE THE UPDATED COUTSE
        await course?.save();

        res.status(200).json({
            success: true,
            course
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// ADD ANSWER IN QUESTIONS
interface IAddAnswerData {
    answer: string,
    courseId: string,
    contentId: string,
    questionId: string
}
export const addAnswer = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body;

        const course = await courseModel.findById(courseId)
        if (!mongoose.Types.ObjectId.isValid(contentId as string)) {
            return next(new ErrorHandler('Invalid content id', 400))
        }

        const courseContent = course?.courseData.find((item: any) => item._id.equals(contentId))
        if (!courseContent) {
            return next(new ErrorHandler('Invalid content id', 400))
        }

        const question = courseContent.questions.find((item: any) => item._id.equals(questionId))
        if (!question) {
            return next(new ErrorHandler('Question id is invalid', 400))
        }

        const newAnswer: any = {
            user: req.user,
            answer,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        // ADD ANSWER TO COURSE DATA
        question.questionReplies?.push(newAnswer)


        await course?.save()

        if (req.user?._id === question.user._id) {
            // CREATE A NOTIFICATION`  
            await notificationModel.create({
                user: req.user?._id,
                title: "New Question Reply Receive",
                message: `You have a new question reply in ${courseContent.title}`,
            });
        } else {
            const data = {
                name: question.user.name,
                title: courseContent.title,

            }
            const html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data)

            try {
                await sendMail({
                    email: question.user.email,
                    subject: 'Question reply',
                    template: 'question-reply.ejs',
                    data,
                })
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 400))
            }
        }

        res.status(200).json({
            success: true,
            course
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// ADD REVIEW IN OUR COURSE
interface IAddReviewData {
    review: string,
    rating: number,
    userId: string,
}
export const addReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        // CHECK IF USER IS ENROLLED IN COURSE
        const courseExists = userCourseList?.some(
            (course: any) => course._id.toString() === courseId?.toString()
        );
        if (!courseExists) {
            return next(new ErrorHandler('You are not eligible to access this course', 404));
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }

        const { review, rating } = req.body as IAddReviewData;

        const reviewData: any = {
            user: req.user,      // store user id
            comment: review,
            rating
        };

        // ADD REVIEW
        course.reviews.push(reviewData);

        // CALCULATE AVERAGE RATING
        let avg = 0;
        course.reviews.forEach((rev: any) => {
            avg += rev.rating;
        });


        if (course) {
            course.ratings = avg / course.reviews.length
        }
        // SAVE COURSE
        await course.save();

        await redis.set(String(courseId), JSON.stringify(course), 'EX', 604800)
        // CREATE A NOTIFICATION
        await notificationModel.create({
            user: req.user?._id,
            title: 'New Review Received ',
            message: `${req.user?.name} has given a review in ${course.name}`,
        });

        res.status(200).json({
            success: true,
            course
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// ADD REPLY IN A REVIEW
interface IAddReplyReview {
    comment: string,
    courseId: string,
    reviewId: string
}
export const addReplyToReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { comment, courseId, reviewId } = req.body as IAddReplyReview;

        const course = await courseModel.findById(courseId)
        if (!course) {
            return next(new ErrorHandler('Course not found', 404))
        }
        const review = course.reviews.find((rev: any) => rev._id.toString() === reviewId)

        if (!review) {
            return next(new ErrorHandler('Review not found', 404))
        }
        const replyData: any = {
            user: req.user,
            comment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        if (!review.commentReplies) {
            review.commentReplies = []
        }
        review.commentReplies.push(replyData)
        await course.save()
        await redis.set(courseId, JSON.stringify(course), 'EX', 604800)
        res.status(200).json({
            success: true,
            course
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// GET ALL COURSES  ---ADMIN
export const getAdminCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAllCoursesService(res)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

//DELETE USER FOR ---ADMIN
export const deleteCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const course = await courseModel.findById(id)
        if (!course) {
            return next(new ErrorHandler('Course not found with this id', 400))
        }

        await course.deleteOne({ id })
        await redis.del(id as string)


        res.status(201).json({
            success: true,
            message: "Course is deleted successfully."
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

//GENERATE VIDEO URL

export const generateVideoUrl = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { videoId } = req.body;
            const response = await axios.post(
                `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
                { ttl: 300 },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
                    },
                }
            );
            res.json(response.data);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);
