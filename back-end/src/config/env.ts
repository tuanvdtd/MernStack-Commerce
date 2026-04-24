import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const schema = z.object({
  NODE_ENV: z.enum(['development','test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  // Keep optional for now because Mongo bootstrap is currently disabled in server.ts.
  MONGO_URI: z.url().optional(),
  LOG_LEVEL: z.string().default('info'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  FRONTEND_BASE_URL: z.url().default('http://localhost:5173'),
})

export const env = schema.parse(process.env)
