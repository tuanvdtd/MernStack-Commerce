import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { UserController } from '~/modules/users/user.controller'
import {
  LoginSchema,
  PatchProfileSchema,
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

r.get(
  '/me',
  authenticate,
  requirePermission(permissions.VIEW_USER),
  asyncHandler(UserController.getMe),
)
r.patch(
  '/me',
  authenticate,
  requirePermission(permissions.VIEW_USER),
  validateRequest(PatchProfileSchema),
  asyncHandler(UserController.patchMe),
)

export default r
