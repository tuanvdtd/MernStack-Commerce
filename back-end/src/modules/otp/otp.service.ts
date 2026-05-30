import { env } from '~/config/env'
import { BrevoProvider } from '~/core/mail/BrevoProdiver'
import { OtpPurpose } from '~/generated/prisma/client'
import { OTP_EXPIRY_MINUTES } from '~/modules/otp/otp.constants'
import { OtpRepo } from '~/modules/otp/otp.repo'
import { generateOtpCode } from '~/utils/generateOtp'

function getExpiryDate(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
}

function getNameFromEmail(email: string): string {
  return email.split('@')[0] || email
}

function buildOtpEmailHtml(email: string, code: string): string {
  const verifyUrl = `${env.FRONTEND_BASE_URL.replace(/\/$/, '')}/verify-otp?email=${encodeURIComponent(email)}`
  const name = getNameFromEmail(email)

  return `
    <h1>Kích hoạt tài khoản</h1>
    <p>Xin chào ${name},</p>
    <p><a href="${verifyUrl}">Hoan tat dang ky</a></p>
    <p>Mã OTP của bạn là: <strong style="font-size: 24px; letter-spacing: 4px;">${code}</strong></p>
    <p>Mã có hiệu lực trong <strong>${OTP_EXPIRY_MINUTES} phút</strong>.</p>
    <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
  `
}

export const OtpService = {
  async createAndSendRegisterOtp(email: string) {
    const code = generateOtpCode()
    const expiresAt = getExpiryDate()

    await OtpRepo.deleteByEmail(email, OtpPurpose.REGISTER)
    await OtpRepo.create(email, code, expiresAt, OtpPurpose.REGISTER)

    const htmlContent = buildOtpEmailHtml(email, code)
    await BrevoProvider.sendEmail(email, 'Mã OTP kích hoạt tài khoản', htmlContent)

    return { expiresAt, expiresInMinutes: OTP_EXPIRY_MINUTES }
  },

  async cleanupExpired() {
    return OtpRepo.deleteExpired()
  },
}
