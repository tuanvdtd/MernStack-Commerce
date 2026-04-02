import { model, Schema } from "mongoose";

const otpSchema = new Schema({
  otp_token: {
    type: String,
    required: true,
  },
  otp_email: {
    type: String,
    required: true,
  },
  otp_expires: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes
  },
  otp_status: {
    type: String,
    enum: ["pending", "active", "block"],
    default: "pending",
  }
}, {
  timestamps: true,
  collection: "otps"
})

const otpModel = model("OtpModel", otpSchema);

export default otpModel;