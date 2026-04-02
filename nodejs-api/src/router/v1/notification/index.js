import NotificationController from "~/controllers/notification.controller"
import asyncHandle from "~/core/errorHandle"
import { authenticationV2 } from "~/auth/authUtils"

import express from "express"
const router = express.Router()

// comment lại test postman cho dễ :))
// router.use(authenticationV2)
router.get('/', asyncHandle(NotificationController.getNotificationsByUserId))


export const notificationRouter = router