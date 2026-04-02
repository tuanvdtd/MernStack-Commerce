import otpModel from "~/models/otp.model";

import { v4 as uuidv4 } from "uuid"

const generateOtp =  () => {
  const token = uuidv4();
  return token;
}

const newOtp = async ({email}) => {
  const token = generateOtp();
  const otp = await otpModel.create({
    otp_token: token,
    otp_email: email,
  });
  return otp;
}

export const OtpService = {
  generateOtp,
  newOtp,
}
