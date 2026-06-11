import _ from 'lodash';

import { ApiError } from '~/core/http/ApiError'
import { OtpPurpose } from '~/generated/prisma/client'
import { OtpRepo } from '~/modules/otp/otp.repo'
import { OtpService } from '~/modules/otp/otp.service'
import { toAuthResponse, toProfileResponse } from '~/modules/users/user.mapper'
import { UserRepo } from '~/modules/users/user.repo'
import type { PatchProfileInput } from '~/modules/users/user.types'
import { hashPassword, verifyPassword } from '~/utils/password'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function getNameFromEmail(email: string): string {
  return email.split('@')[0] || email
}

export const UserService = {
  async register(email: string) {
    const normalizedEmail = normalizeEmail(email)
    const existed = await UserRepo.findByEmail(normalizedEmail)
    if (existed) throw new ApiError(409, 'Email already exists')

    await OtpService.createAndSendRegisterOtp(normalizedEmail)

    return {
      email: normalizedEmail,
      message: 'Registration started. Please check your email for the OTP to finish creating your account.',
    }
  },

  async completeRegistration(email: string, code: string, password: string, verifyPassword: string) {
    const normalizedEmail = normalizeEmail(email)
    if (password !== verifyPassword) throw new ApiError(400, 'Password confirmation does not match')

    const existed = await UserRepo.findByEmail(normalizedEmail)
    if (existed) throw new ApiError(409, 'Email already exists')

    const otp = await OtpRepo.findValid(normalizedEmail, code, OtpPurpose.REGISTER)
    if (!otp) throw new ApiError(400, 'Invalid or expired OTP')

    const otpEmail = normalizeEmail(otp.email)
    const passwordHash = await hashPassword(password)
    const user = await UserRepo.create(
      {
        email: otpEmail,
        name: getNameFromEmail(otpEmail),
        password: passwordHash,
      },
      true,
    )

    await OtpRepo.deleteByEmail(otpEmail, OtpPurpose.REGISTER)

    return {
      ..._.omit(user, ['password']),
      message: 'Account created successfully',
    }
  },

  async resendRegistrationOtp(email: string) {
    const normalizedEmail = normalizeEmail(email)
    const existed = await UserRepo.findByEmail(normalizedEmail)
    if (existed) throw new ApiError(409, 'Email already exists')

    return OtpService.createAndSendRegisterOtp(normalizedEmail)
  },

  async login(email: string, password: string) {
    const user = await UserRepo.findByEmail(normalizeEmail(email))
    if (!user) throw new ApiError(404, 'User not found')
    if (!user.isActive) {
      throw new ApiError(403, 'Account is not activated. Please verify your email with the OTP sent during registration.')
    }
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) throw new ApiError(401, 'Invalid password')

    return toAuthResponse(user)
  },

  async list() {
    return UserRepo.list()
  },

  /** Lấy profile user đang đăng nhập. */
  async getMe(userId: number) {
    const user = await UserRepo.findById(userId)
    if (!user) throw new ApiError(404, 'User not found')
    return toProfileResponse(user)
  },

  /** PATCH partial profile — chỉ field được gửi lên. */
  async patchProfile(userId: number, input: PatchProfileInput) {
    const user = await UserRepo.findById(userId)
    if (!user) throw new ApiError(404, 'User not found')

    const data: PatchProfileInput = {}
    if (input.name !== undefined) data.name = input.name.trim()
    if (input.phone !== undefined) {
      data.phone = input.phone === null || input.phone === '' ? null : input.phone.trim()
    }

    const updated = await UserRepo.updateProfile(userId, data)
    return toProfileResponse(updated)
  },
}
