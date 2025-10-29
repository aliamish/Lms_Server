"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const analytics_1 = require("../controllers/analytics");
const user_1 = require("../controllers/user");
const analyticRouter = express_1.default.Router();
analyticRouter.get('/get-users-analytics', user_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin'), analytics_1.getUsersAnalytics);
analyticRouter.get('/get-courses-analytics', user_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin'), analytics_1.getCoursesAnalytics);
analyticRouter.get('/get-orders-analytics', user_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin'), analytics_1.getOrdersAnalytics);
exports.default = analyticRouter;
//# sourceMappingURL=analyticsRout.js.map