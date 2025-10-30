import express from 'express'
import { authorizeRoles, isAuthenticated } from '../middleware/auth'
import { getNotification, updateNotification } from '../controllers/notification'
import { updateAccessToken } from '../controllers/user'

const notificationRouter = express.Router()

notificationRouter.get('/get-all-notifications',updateAccessToken, isAuthenticated, authorizeRoles('admin'), getNotification)
notificationRouter.put('/update-notification/:id',updateAccessToken, isAuthenticated, authorizeRoles('admin'), updateNotification)

export default notificationRouter