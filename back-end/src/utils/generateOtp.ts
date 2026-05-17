import crypto from 'node:crypto'

import { OTP_LENGTH } from '~/modules/otp/otp.constants'

export function generateOtpCode(): string {
  const max = 10 ** OTP_LENGTH
  const min = 10 ** (OTP_LENGTH - 1)
  return crypto.randomInt(min, max).toString()
}
