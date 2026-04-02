import { createClient } from "redis"

class RedisPubsubService {
  constructor() {
    this.subscriber = createClient()
    this.publisher = createClient()
    this.isReady = false

    this.subscriber.on('error', (err) => {
      console.error('Redis Subscriber Error:', err)
    })
    this.publisher.on('error', (err) => {
      console.error('Redis Publisher Error:', err)
    })

    this.connectClients()
  }

  async connectClients() {
    try {
      if (!this.subscriber.isOpen) {
        await this.subscriber.connect()
        console.log('Redis Subscriber Connected')
      }
      if (!this.publisher.isOpen) {
        await this.publisher.connect()
        console.log('Redis Publisher Connected')
      }
      this.isReady = true
    } catch (error) {
      console.error('Failed to connect Redis clients:', error)
      this.isReady = false
    }
  }

  async ensureConnected() {
    if (!this.isReady) {
      await this.connectClients()
    }
  }

  async publish(channel, message) {
    try {
      await this.ensureConnected()
      const reply = await this.publisher.publish(channel, message)
      console.log('Message published:', reply)
      return reply
    } catch (err) {
      console.error('Error publishing message:', err)
      throw err
    }
  }

  async subscribe(channel, callback) {
    await this.ensureConnected()
    await this.subscriber.subscribe(channel, (message) => {
      callback(channel, JSON.parse(message))
    })
  }

}
export const redisPubsubService = new RedisPubsubService()