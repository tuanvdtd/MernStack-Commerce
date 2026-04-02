import apiKeyModel from '~/models/apikey.model.js';
import crypto from 'crypto';

const findById = async (key) => {
  // gen key example
  // const keyExample =  await crypto.randomBytes(64).toString("hex");
  // const newKey = await apiKeyModel.create({ key: keyExample, permissions: ['0000'] });
  // console.log('key', newKey)
  const objKey = await apiKeyModel.findOne({ key: key, status: true }).lean();
  return objKey;
};

export default findById;