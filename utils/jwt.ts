require('dotenv').config()
import { Response } from 'express'
import { IUser } from '../models/userModel'
import { redis } from './redis'


interface ITokenOptions {
    expires: Date,
    maxAge: number,
    httpOnly: boolean,
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean
}


// PARSE ENVIROMENT VARIABLE  TO INTEGRATS WITH FALLBACK VALUES
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10)
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10)


// OPTIONS FOR COOKIES 

export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true
}
export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true
}

export const sendToken = async (user: IUser, statusCode: number, res: Response) => {
    const accessToken = user.SignAccessToken()
    const refreshtoken = user.SignRefreshToken()

    // UPLOAD SESSION TO REDIS
    await redis.set(String(user._id), JSON.stringify(user));

    // ONLY SET SECRET TO TRUE IN PRODUCTION

    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true
        refreshTokenOptions.secure = true
    }

    res.cookie('access_token', accessToken, accessTokenOptions)
    res.cookie('refresh_token', refreshtoken, refreshTokenOptions)

    res.status(statusCode).json({
        success: true,
        user,
        accessToken
    })
}