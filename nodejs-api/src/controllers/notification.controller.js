import { notificationService } from "~/services/notification.service"
import { SuccessResponse } from "~/core/success.response"

class NotificationController {
  // async createNotification(req, res, next) {
  //   new SuccessResponse({
  //     message: "Notification created successfully",
  //     metadata: await notificationService.createNotification({ ...req.body })
  //   }).send(res)
  // }

  static getNotificationsByUserId = async (req, res, next) => {
    new SuccessResponse({
      message: "Notifications retrieved successfully",
      metadata: await notificationService.getNotificationsByUserId({ ...req.query })
    }).send(res)
  }
}

export default NotificationController