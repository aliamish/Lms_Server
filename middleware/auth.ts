import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt from "jsonwebtoken";
import { redis } from "../utils/redis";

interface JwtPayload {
    id: string;
    iat: number;
    exp: number;
}

export const isAuthenticated = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
        return next(new ErrorHandler('Please login to access this resourses.', 400))
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload

    if (!decoded) {
        return next(new ErrorHandler('Access token is not valid.', 400))
    }

    const user = await redis.get((decoded.id))

    if (!user) {
        return next(new ErrorHandler('Please login to access this recourses.', 401))
    }

    req.user = JSON.parse(user)

    next()
})

// VALIDATE THE ROLE OF USER
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resourses`, 403))
        }
        next()
    }
}
