import _ from 'lodash';
import { ApiError } from '~/core/http/ApiError'
import { OtpService } from '~/modules/otp/otp.service'
import { UserRepo } from '~/modules/users/user.repo'
import { hashPassword, verifyPassword } from '~/utils/password'

export const UserService = {
  async register(email: string, name: string, password: string) {
    const existed = await UserRepo.findByEmail(email)
    if (existed) throw new ApiError(409, 'Email already exists')
    const passwordHash = await hashPassword(password)
    const user = await UserRepo.create({
      email,
      name,
      password: passwordHash
    })

    await OtpService.createAndSendRegisterOtp(email, name)
    const pickUser = _.omit(user, ['password'])
      return {
        ...pickUser,
        message: 'Registration successful. Please check your email for the OTP to activate your account.',
    }
  },

  async login(email: string, password: string) {
    const user = await UserRepo.findByEmail(email)
    if (!user) throw new ApiError(404, 'User not found')
    if (!user.isActive) {
      throw new ApiError(403, 'Account is not activated. Please verify your email with the OTP sent during registration.')
    }
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) throw new ApiError(401, 'Invalid password')
    // sử dụng jwt để tạo token
    return user
  },

  async list() {
    return UserRepo.list()
  }
}
