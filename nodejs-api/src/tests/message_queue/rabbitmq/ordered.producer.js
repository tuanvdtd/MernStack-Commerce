const amqp = require("amqplib")


async function producerOrderedMessage() {
  const connection = await amqp.connect("amqp://localhost")
  const channel = await connection.createChannel()
  const queueName = "ordered_queue_message"
  await channel.assertQueue(queueName, { durable: true })

  for (let index = 0; index < 10; index++) {
    const message = `Ordered Message ${index + 1}`
    console.log("message:", message)
    channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true,
    })

    setTimeout(() => {
      connection.close()
      process.exit(0)
    }, 1000);
  }
}

producerOrderedMessage().catch((error) => {
  console.error("Error in ordered consumer:", error)
})