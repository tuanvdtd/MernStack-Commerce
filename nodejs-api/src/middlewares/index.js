import { loggerDiscordV2 } from "~/loggers/discord.logv2"

const pushToLogDiscord = async (req, res, next) => {
  try {
    loggerDiscordV2.sendToFormatCode({
      code: req.method === 'GET' ? req.query : req.body,
      title: `Method: ${req.method}`,
      message: `${req.get('host')}${req.originalUrl}`
    })
    return next()
  } catch (error) {
    next(error)
  }
}

export { pushToLogDiscord }