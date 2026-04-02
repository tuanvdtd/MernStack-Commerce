import { ForbiddenError } from "~/core/error.response";
import { SuccessResponse } from "~/core/success.response"
import { EmailService } from "./email.service";

import userModel from "~/models/user.model"

const newUser = async ({
  email = null,
  captcha = null,
}) => {
  const user = await userModel.findOne({
    email
  }).lean();
  if (user) {
    throw new ForbiddenError('Email đã được đăng ký, vui lòng đăng nhập!');
  }
  // send token via email user
  const token = await EmailService.sendEmailToken({ email });
  return { email, token };
}

export const UserService = {
  newUser,
}