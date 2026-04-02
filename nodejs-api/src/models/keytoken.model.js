import { model, Schema, Types } from "mongoose";

const DOCUMENT_NAME = "Key";
const COLLECTION_NAME = "Keys";

const tokenSchema = new Schema({
  accessTokenKey: {
    type: String,
    required: true
  },
  refreshTokenKey: {
    type: String,
    required: true
  },
  refreshTokenUsed: {
    type: [String],
    default: []
  },
  refreshToken: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Shop"
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
});

const keyModel = model(DOCUMENT_NAME, tokenSchema);

export default keyModel;