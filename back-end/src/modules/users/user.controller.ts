import { Request, Response } from 'express'

import { OtpService } from '~/modules/otp/otp.service'
import { UserService } from '~/modules/users/user.service'

export const UserController = {
  register: async (req: Request, res: Response) => {
    const { email, name, password } = req.body
    const user = await UserService.register(email, name, password)
    return res.status(201).json(user)
  },

  login: async (req: Request, res: Response) => {
    const { email, password } = req.body
    const user = await UserService.login(email, password)
    return res.status(200).json(user)
  },

  list: async (_req: Request, res: Response) => {
    const users = await UserService.list()
    res.json(users)
  },

  verifyOtp: async (req: Request, res: Response) => {
    const { email, code } = req.body
    const result = await OtpService.verifyRegisterOtp(email, code)
    return res.status(200).json(result)
  },

  resendOtp: async (req: Request, res: Response) => {
    const { email } = req.body
    const result = await OtpService.resendRegisterOtp(email)
    return res.status(200).json({
      message: 'OTP has been resent to your email',
      expiresInMinutes: result.expiresInMinutes,
    })
  },
}
