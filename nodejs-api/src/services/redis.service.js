import { createClient } from "redis"
import { reservationInventory } from "../models/repositories/inventory.repo.js"

// Tạo Redis client
// const redisClient = createClient({
//   url: process.env.REDIS_URL || 'redis://localhost:6379'
// })

// // Xử lý lỗi
// redisClient.on('error', (err) => {
//   console.error('Redis Client Error:', err)
// })

// // Connect to Redis
// redisClient.on('connect', () => {
//   console.log('Redis Client Connected')
// })

// // Khởi tạo kết nối (gọi 1 lần duy nhất)
// const connectRedis = async () => {
//   try {
//     if (!redisClient.isOpen) {
//       await redisClient.connect()
//     }
//   } catch (error) {
//     console.error('Failed to connect to Redis:', error)
//   }
// }

// connectRedis()

import { RedisDB } from "../dbs/init.redis.js"
const redisClient = RedisDB.getRedis().instanceConnect

// Ứng dụng khóa lạc quan
const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2025_${productId}`
  // số lần thử nếu không thành công cầm key
  const retryTimes = 10
  const expireTime = 3000 // 3 seconds lock (milliseconds)
  
  for (let i = 0; i < retryTimes; i++) {
    try {
      // tạo 1 key, ai cầm key thì được phép thay đổi dữ liệu
      // SET key value NX PX expireTime (NX = only set if not exists, PX = expire in milliseconds)
      const result = await redisClient.set(key, cartId, {
        NX: true, // Only set if not exists
        PX: expireTime // Expire 3s
      })
      
      console.log(`Acquire lock attempt ${i + 1}:`, result)
      
      if (result === 'OK') {
        // thao tác với kho hàng inventory
        const isReservation = await reservationInventory({ 
          productId, 
          quantity, 
          cartId 
        })
        
        if (isReservation.modifiedCount) {
          return key // trả về key để sau này release lock
        }
        
        // // Nếu không reserve được thì release lock ngay
        // await releaseLock(key)
        return null
      } else {  
        // chờ một khoảng thời gian rồi thử lại
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    } catch (error) {
      console.error(`Error acquiring lock for ${productId}:`, error)
      return null
    }
  }
  
  return null // Không lấy được lock sau retryTimes lần thử
}

const releaseLock = async (keyLock) => {
  try {
    return await redisClient.del(keyLock)
  } catch (error) {
    console.error('Error releasing lock:', error)
    return 0
  }
}

export { acquireLock, releaseLock, redisClient }