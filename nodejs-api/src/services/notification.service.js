import { notificationModel } from "~/models/notification.model"

class NotificationService {
  async createNotification({
    type = 'PROMOTION-001',
    senderId,
    receiverId = 1,

    options = {}
  }) {
    let noti_content
    if (type === 'SHOP-001') {
      noti_content = `@@@ has been added to the @@@@. Check it out!`
    }
    else if (type === 'PROMOTION-001') {
      noti_content = `@@@ available! Don't miss out on our latest deals.`
    }
    const newNotification = await notificationModel.create({
      noti_type: type,
      noti_senderId: senderId,
      noti_receiverId: receiverId,
      noti_content,
      noti_options: options
    })
    return newNotification
  }

  async getNotificationsByUserId({
    receiverId = 1,
    isRead = 0,
    type = 'All'
  }) {
    const matchConditions = {
      noti_receiverId: receiverId
    }
    if (isRead === 1) {
      matchConditions.noti_isRead = true
    }
    if (type !== 'All') {
      matchConditions.noti_type = type
    }
    return await notificationModel.aggregate([
      {
        $match: matchConditions
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: {
          noti_type: 1,
          noti_senderId: 1,
          noti_content: 1,
          noti_isRead: 1,
          noti_options: 1,
          createdAt: 1,
        }
      }
    ])
  }
   
}

export const notificationService = new NotificationService()