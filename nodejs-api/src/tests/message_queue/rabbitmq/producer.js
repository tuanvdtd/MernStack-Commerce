const amqp = require("amqplib")

const message = 'Hello, RabbitMQ! from shop service! A product has been added. Notify all followers.'

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost")
    const channel = await connection.createChannel()
    const queueName = "shop_queue"
    await channel.assertQueue(queueName, { durable: true })
    // Send message to the queue
    channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true, // persistent để đảm bảo tin nhắn không bị mất khi RabbitMQ khởi động lại
    })
    console.log(`Message sent to ${queueName}: ${message}`)
    setTimeout(async () => {
      await connection.close()
      process.exit(0)
    }, 500);
  } catch (error) {
    
  }
}

runProducer().catch((error) => {
  console.error("Error in producer:", error)
})