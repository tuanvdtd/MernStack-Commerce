import 'dotenv/config'
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase'

const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 3052,
  },
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase',
    host: process.env.DEV_DB_HOST || 'localhost',
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || 'shopDev',
  },
}

const pro = {
  app: {
    port: process.env.PRO_APP_PORT || 3052,
  },
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase',
    host: process.env.PRO_DB_HOST || 'localhost',
    port: process.env.PRO_DB_PORT || 27017,
    name: process.env.PRO_DB_NAME || 'shopPro',
  },
} 

const config = {
  dev,
  pro,
}

const env = process.env.NODE_ENV || 'dev'
const configEnv = config[env]

export default configEnv