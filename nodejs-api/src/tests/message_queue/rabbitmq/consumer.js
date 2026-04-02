const amqp = require("amqplib")

const message = 'Hello, RabbitMQ! from shop service'

const runConsumer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost")
    const channel = await connection.createChannel()

    const queueName = "shop_queue"
    await channel.assertQueue(queueName, { durable: true })
    // Send message to the queue
    channel.consume(queueName, (msg) => {
      console.log(`Received message: ${msg.content.toString()}`)
    }, {
      noAck: true // noAck true để tự động xác nhận tin nhắn đã được nhận
    })
    // await channel.close()
    // await connection.close()
  } catch (error) {
    
  }
}

runConsumer().catch((error) => {
  console.error("Error in consumer:", error)
})