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
  DATABASE_URL: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_PORT: z.coerce.number(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  BREVO_API_KEY: z.string(),
  ADMIN_EMAIL_ADDRESS: z.string(),
  ADMIN_EMAIL_NAME: z.string(),
})

export const env = schema.parse(process.env)
