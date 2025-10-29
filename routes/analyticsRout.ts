import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getCoursesAnalytics, getOrdersAnalytics, getUsersAnalytics } from "../controllers/analytics";
import { updateAccessToken } from "../controllers/user";

const analyticRouter = express.Router()

analyticRouter.get('/get-users-analytics',updateAccessToken, isAuthenticated, authorizeRoles('admin'), getUsersAnalytics)

analyticRouter.get('/get-courses-analytics',updateAccessToken, isAuthenticated, authorizeRoles('admin'), getCoursesAnalytics)

analyticRouter.get('/get-orders-analytics',updateAccessToken, isAuthenticated, authorizeRoles('admin'), getOrdersAnalytics)


export default analyticRouter