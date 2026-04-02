import mongoose from "mongoose"
import checkDB from '../helpers/check.connect.js';
import configEnv from "../configs/config.mongodb.js";

const connectStringAtlas = configEnv.db.uri
const connectStringLocal = `mongodb://${configEnv.db.host}:${configEnv.db.port}/${configEnv.db.name}`

class Database {
  constructor() {
    this.connect()
  }

  connect(type = 'mongodb') {
    // Dùng cho dev môi trường để hiện debug log của mongoose
    if (1 === 1) {
      mongoose.set('debug', true)
      mongoose.set('debug', { color: true })
    }

    mongoose.connect(connectStringLocal)
      .then(() => {
          console.log("Connected to MongoDB Pro:", configEnv.db.name)
          checkDB.countConnect()
          // checkDB.checkOverload()
        })
      .catch(err => console.error("Error connecting to MongoDB Pro:", err))
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }
}
const instanceMongoDB = Database.getInstance()

export default instanceMongoDB

