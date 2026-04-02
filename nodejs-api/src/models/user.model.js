import { model, Schema } from "mongoose"

const userSchema = new Schema({
  user_id: {
    type: Number,
    required: true,
  },
  user_slug: {
    type: String,
    required: true
  },
  user_name: {
    type: String,
    required: true
  },
  user_email: {
    type: String,
    required: true
  },
  user_password: {
    type: String,
    required: true
  },
  user_phone: {
    type: String,
    required: true
  },
  user_sex: {
    type: String,
    required: true
  },
  user_avatar: {
    type: String,
    required: true
  },
  user_role: {
    type: Schema.Types.ObjectId,
    ref: "Role",
  },
  user_dob: {
    type: Date,
    default: null
  },
  user_status: {
    type: String,
    default: "peding",
    enum: ["peding", "active", "block"]
  },
}, { 
  collection: "Users",
  timestamps: true 
})

const userModel = model("User", userSchema)

export default userModel