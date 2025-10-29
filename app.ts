require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/userRout";
import courseRouter from "./routes/courseRout";
import orderRouter from "./routes/orderRout";
import notificationRouter from "./routes/notificationRout";
import analyticRouter from "./routes/analyticsRout";
import layoutRouter from "./routes/layoutRout";
export const app = express();
const { rateLimit } = require("express-rate-limit");

// BODY PARSER
app.use(express.json({ limit: "50mb" }));

// COOKIE PARSER
app.use(cookieparser());

// CORS  =>  CORS ORIGIN RECOURSES SHARING
app.use(
  cors({
    origin: [
      "https://e-learning-client-lilac-zeta.vercel.app",
      "http://localhost:3000",
    ],

    credentials: true,
  })
);

// SET API LIMIT

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeader: "draft-7",
  legacyHeaders: false,
});

// ROUTES

app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", analyticRouter);
app.use("/api/v1", layoutRouter);

// TESTING API
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Api is working successfully",
  });
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message:
      "Welcome to the LMS API. Use /api/v1 for API endpoints or /test for a test route.",
  });
});

app.use(limiter);
app.use(ErrorMiddleware);
