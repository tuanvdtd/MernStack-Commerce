import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { UserService } from '~/modules/users/user.service'
import type { PatchProfileInput } from '~/modules/users/user.types'

export const UserController = {
  /** GET /user/me — profile user đang đăng nhập. */
  getMe: async (req: AuthRequest, res: Response) => {
    const profile = await UserService.getMe(req.user!.id)
    return res.status(200).json(profile)
  },

  /** PATCH /user/me — cập nhật partial profile. */
  patchMe: async (req: AuthRequest, res: Response) => {
    const profile = await UserService.patchProfile(
      req.user!.id,
      req.body as PatchProfileInput,
    )
    return res.status(200).json(profile)
  },

  // Register a new user test cicd ver2
  register: async (req: AuthRequest, res: Response) => {
    const { email } = req.body
    const user = await UserService.register(email)
    return res.status(201).json(user)
  },

  login: async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body
    const user = await UserService.login(email, password)
    return res.status(200).json(user)
  },

  list: async (_req: AuthRequest, res: Response) => {
    const users = await UserService.list()
    res.json(users)
  },

  verifyOtp: async (req: AuthRequest, res: Response) => {
    const { email, code, password, verifyPassword } = req.body
    const result = await UserService.completeRegistration(email, code, password, verifyPassword)
    return res.status(200).json(result)
  },

  resendOtp: async (req: AuthRequest, res: Response) => {
    const { email } = req.body
    const result = await UserService.resendRegistrationOtp(email)
    return res.status(200).json({
      message: 'OTP has been resent to your email',
      expiresInMinutes: result.expiresInMinutes,
    })
  },
}
