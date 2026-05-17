import { Router } from 'express'

import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { UserController } from '~/modules/users/user.controller'
import {
  LoginSchema,
  RegisterSchema,
  ResendOtpSchema,
  VerifyOtpSchema,
} from '~/modules/users/user.validation'

const r = Router()
r.post('/register', validateRequest(RegisterSchema), asyncHandler(UserController.register))
r.post('/verify-otp', validateRequest(VerifyOtpSchema), asyncHandler(UserController.verifyOtp))
r.post('/resend-otp', validateRequest(ResendOtpSchema), asyncHandler(UserController.resendOtp))
r.post('/login', validateRequest(LoginSchema), asyncHandler(UserController.login))
r.get('/list', asyncHandler(UserController.list))
export default r
