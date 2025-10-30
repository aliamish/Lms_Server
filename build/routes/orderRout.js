"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const order_1 = require("../controllers/order");
const user_1 = require("../controllers/user");
const orderRouter = express_1.default.Router();
orderRouter.post('/create-order', user_1.updateAccessToken, auth_1.isAuthenticated, order_1.createOrder);
orderRouter.get('/get-orders', user_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin'), order_1.getAllOrders);
orderRouter.get('/payment/stripepublishablekey', order_1.sendStripePublishKey);
orderRouter.post('/payment', auth_1.isAuthenticated, order_1.newPayment);
exports.default = orderRouter;
//# sourceMappingURL=orderRout.js.map