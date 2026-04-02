const amqp = require("amqplib")

async function consumerOrderedMessage() {
  const connection = await amqp.connect("amqp://localhost")
  const channel = await connection.createChannel()
  const queueName = "ordered_queue_message"
  await channel.assertQueue(queueName, { durable: true })

  // set prefetch to 1 to process only one message at a time
  channel.prefetch(1)

  channel.consume(queueName, (msg) => {
    const messageContent = msg.content.toString()

    setTimeout(() => {
      console.log(`process message: ${messageContent}`)
      channel.ack(msg)
    }, Math.random() * 1000);
  })

}

consumerOrderedMessage().catch((error) => {
  console.error("Error in ordered consumer:", error)
})