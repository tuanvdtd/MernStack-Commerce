import { createClient } from 'redis'
import { RedisError } from '../core/error.response.js'
import { clear } from 'winston';

let client = {}, statusConnectRedis = {
  CONNECT: 'connect',
  END: 'end',
  RECONNECT: 'reconnecting',
  ERROR: 'error'
}, connectionTimeout

const REDIS_CONNECT_TIMEOUT = 10000; // 10 seconds
const REDIS_CONNECT_MESSAGE = {
  code: -99,
  message: {
    vi: 'Kết nối Redis thất bại, vui lòng thử lại sau',
    en: 'Redis connection failed, please try again later'
  }
};

const handleTimeoutConnect = () => {
  connectionTimeout = setTimeout(() => {
    throw new RedisError({
      message: REDIS_CONNECT_MESSAGE.message.vi,
      statusCode: REDIS_CONNECT_MESSAGE.code
    })
  }, REDIS_CONNECT_TIMEOUT)
}

const handleEventConnect = ({
  connectionRedis
}) => {
  // check event connect
  connectionRedis.on(statusConnectRedis.CONNECT, () => {
    console.log('Redis status: connected')
    // clear timeout khi kết nối thành công
    clearTimeout(connectionTimeout)
  })
  connectionRedis.on(statusConnectRedis.END, () => {
    console.log('Redis status: disconnected')
    // retry
    handleTimeoutConnect()
  })
  connectionRedis.on(statusConnectRedis.RECONNECT, () => {
    console.log('Redis status: reconnecting...')
    clearTimeout(connectionTimeout)
  })
  connectionRedis.on(statusConnectRedis.ERROR, (error) => {
    console.log('Redis status:error:', error.code)
    handleTimeoutConnect()
  })
}

const initRedis = async () => {
  try {
    console.log('Initializing Redis client...')
    const instanceRedis = createClient()
    client.instanceConnect = instanceRedis
    handleEventConnect({connectionRedis: instanceRedis})
    // connect the client (redis v4+ requires explicit connect)
    await instanceRedis.connect()
  } catch (error) {
    // console.error('Failed to initialize Redis client:', error)
    throw error
  }
}

// Lấy kết nối Redis
const getRedis = () => {
  return client
}

// Đóng kết nối Redis
const closeRedis = () => {
  if (client.instanceConnect) {
    client.instanceConnect.quit()
  }
  client.instanceConnect = null
}

export const RedisDB = {
  initRedis,
  getRedis,
  closeRedis
}