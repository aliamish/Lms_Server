import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createOrder, getAllOrders, newPayment, sendStripePublishKey } from "../controllers/order";
import { updateAccessToken } from "../controllers/user";



const orderRouter = express.Router();

orderRouter.post('/create-order', updateAccessToken, isAuthenticated, createOrder)
orderRouter.get('/get-orders', updateAccessToken, isAuthenticated, authorizeRoles('admin'), getAllOrders)
orderRouter.get('/payment/stripepublishablekey', sendStripePublishKey)
orderRouter.post('/payment', isAuthenticated, newPayment)


export default orderRouter