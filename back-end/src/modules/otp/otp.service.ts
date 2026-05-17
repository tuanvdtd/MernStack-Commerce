import { OtpPurpose } from '~/generated/prisma/client'
import { BrevoProvider } from '~/core/mail/BrevoProdiver'
import { ApiError } from '~/core/http/ApiError'
import { OTP_EXPIRY_MINUTES } from '~/modules/otp/otp.constants'
import { OtpRepo } from '~/modules/otp/otp.repo'
import { UserRepo } from '~/modules/users/user.repo'
import { generateOtpCode } from '~/utils/generateOtp'

function getExpiryDate(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
}

function buildOtpEmailHtml(name: string, code: string): string {
  return `
    <h1>Kích hoạt tài khoản</h1>
    <p>Xin chào ${name},</p>
    <p>Mã OTP của bạn là: <strong style="font-size: 24px; letter-spacing: 4px;">${code}</strong></p>
    <p>Mã có hiệu lực trong <strong>${OTP_EXPIRY_MINUTES} phút</strong>.</p>
    <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
  `
}

export const OtpService = {
  async createAndSendRegisterOtp(email: string, name: string) {
    const code = generateOtpCode()
    const expiresAt = getExpiryDate()

    await OtpRepo.deleteByEmail(email, OtpPurpose.REGISTER)
    await OtpRepo.create(email, code, expiresAt, OtpPurpose.REGISTER)

    const htmlContent = buildOtpEmailHtml(name, code)
    await BrevoProvider.sendEmail(email, 'Mã OTP kích hoạt tài khoản', htmlContent)

    return { expiresAt, expiresInMinutes: OTP_EXPIRY_MINUTES }
  },

  async verifyRegisterOtp(email: string, code: string) {
    const user = await UserRepo.findByEmail(email)
    if (!user) throw new ApiError(404, 'User not found')
    if (user.isActive) throw new ApiError(400, 'Account is already activated')

    const otp = await OtpRepo.findValid(email, code, OtpPurpose.REGISTER)
    if (!otp) throw new ApiError(400, 'Invalid or expired OTP')

    await UserRepo.setActive(email, true)
    await OtpRepo.deleteByEmail(email, OtpPurpose.REGISTER)

    return { message: 'Account activated successfully' }
  },

  async resendRegisterOtp(email: string) {
    const user = await UserRepo.findByEmail(email)
    if (!user) throw new ApiError(404, 'User not found')
    if (user.isActive) throw new ApiError(400, 'Account is already activated')

    return this.createAndSendRegisterOtp(email, user.name)
  },

  async cleanupExpired() {
    return OtpRepo.deleteExpired()
  },
}
