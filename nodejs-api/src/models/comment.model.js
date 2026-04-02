import { model, Schema } from "mongoose"

const DOCUMENT_NAME = "Comment"
const COLLECTION_NAME = "Comments"

const CommentSchema = new Schema({
  comment_productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  comment_userId: {
    type: Number,
    default: 1,
  },
  comment_content: {
    type: String,
    default: "text"
  },
  comment_left: {
    type: Number,
    default: 0
  },
  comment_right: {
    type: Number,
    default: 0
  },
  comment_parentId: {
    type: Schema.Types.ObjectId,
    ref: DOCUMENT_NAME,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

export const commentModel = model(DOCUMENT_NAME, CommentSchema)