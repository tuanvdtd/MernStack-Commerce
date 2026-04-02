const amqp = require("amqplib")

const message = 'Hello, RabbitMQ! from shop service! A product has been added. Notify all followers.'

const log = console.log
console.log = function () {
  log.apply(console, [new Date()].concat(arguments))
}

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost")
    const channel = await connection.createChannel()

    // khai báo exchange
    const notificationExchange = "notification_exchange"
    const notiQueue = "notification_queue" // assertQueue cần khai báo queue
    const notificationExchangeDLX = "notification_exchange_dlx"
    const notificationRoutingKey = "notification_routing_key"
    
    // 1. Khai báo exchange DLX
    await channel.assertExchange(notificationExchange, "direct", { durable: true })
  
    // 2. Khai báo queue và liên kết với DLX
    const queueRs = await channel.assertQueue(notiQueue,
      { exclusive: false, // cho phép nhiều kết nối cùng sử dụng queue này
        deadLetterExchange: notificationExchangeDLX, // khai báo DLX cho queue
        deadLetterRoutingKey: notificationRoutingKey // khai báo routing key cho DLX
      })

    // 3. Binding queue với exchange
    await channel.bindQueue(queueRs.queue, notificationExchange) // binding queue với exchange
    
    // 4. Gửi message đến exchange thay vì gửi trực tiếp đến queue
    const msg = 'a new product has been added!'
    console.log("producer send:", msg)
    await channel.sendToQueue(queueRs.queue, Buffer.from(msg), {
      expiration: '10000', // tin nhắn sẽ hết hạn sau 10 giây
    })
    
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