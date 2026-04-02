import { model, Schema } from "mongoose"

const userSchema = new Schema({
  src_name: { //profile,....
    type: String,
    required: true
  },
  src_slug: { // code 001....
    type: String,
    required: true
  },
  src_description: {
    type: String,
    default: ""
  }
}, {
  timestamps: true,
  collection: "Resources"
})

const resourceModel = model("Resource", userSchema)

export default resourceModel