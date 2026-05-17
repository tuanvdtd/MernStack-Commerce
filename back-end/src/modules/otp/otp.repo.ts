import { OtpPurpose } from '~/generated/prisma/client'
import { prisma } from '~/lib/prisma'

export const OtpRepo = {
  async deleteByEmail(email: string, purpose: OtpPurpose = OtpPurpose.REGISTER) {
    return prisma.otp.deleteMany({
      where: { email, purpose },
    })
  },

  async create(email: string, code: string, expiresAt: Date, purpose: OtpPurpose = OtpPurpose.REGISTER) {
    return prisma.otp.create({
      data: { email, code, expiresAt, purpose },
    })
  },

  async findValid(email: string, code: string, purpose: OtpPurpose = OtpPurpose.REGISTER) {
    return prisma.otp.findFirst({
      where: {
        email,
        code,
        purpose,
        expiresAt: { gt: new Date() },
      },
    })
  },

  async deleteExpired() {
    return prisma.otp.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
  },
}
