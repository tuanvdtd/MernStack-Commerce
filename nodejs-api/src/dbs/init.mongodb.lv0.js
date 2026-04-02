import mongoose from "mongoose"
import 'dotenv/config'

const connectString = process.env.MONGODB_URI
const connectMongoDBLV0 =  async () => {
  try {
    await mongoose.connect(connectString)
    console.log("Connected to MongoDB LV0")
  } catch (error) {
    console.error("Error connecting to MongoDB LV0:", error)
  }
}

export default connectMongoDBLV0



