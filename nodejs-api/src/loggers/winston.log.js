import winston from "winston"
import { env } from "~/configs/enviroments"

const { combine, timestamp, printf, align } = winston.format;

const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'debug',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS A'
    }),
    align(),
    printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/test.log' })
  ] 
});

export default logger;