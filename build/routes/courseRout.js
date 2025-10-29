"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const course_1 = require("../controllers/course");
const user_1 = require("../controllers/user");
const courseRouter = express_1.default.Router();
courseRouter.post('/create-course', user_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin'), course_1.uploadCourse);
courseRouter.put('/edit-course/:id', user_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin'), course_1.editCourse);
courseRouter.get('/get-course/:id', course_1.getSingleCourse);
courseRouter.get('/get-courses', course_1.getAllCourses);
courseRouter.get('/get-course-content/:id', user_1.updateAccessToken, auth_1.isAuthenticated, course_1.getCourseByUser);
courseRouter.put('/add-question', user_1.updateAccessToken, auth_1.isAuthenticated, course_1.addQuestion);
courseRouter.put('/add-answer', user_1.updateAccessToken, auth_1.isAuthenticated, course_1.addAnswer);
courseRouter.put('/add-review/:id', user_1.updateAccessToken, auth_1.isAuthenticated, course_1.addReview);
courseRouter.put('/add-reply', user_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin'), course_1.addReplyToReview);
courseRouter.get('/get-admin-courses', user_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin'), course_1.getAdminCourses);
courseRouter.post('/getVdoCipherOTP', course_1.generateVideoUrl);
courseRouter.delete('/delete-course/:id', user_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin'), course_1.deleteCourse);
exports.default = courseRouter;
//# sourceMappingURL=courseRout.js.map