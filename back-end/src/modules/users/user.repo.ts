import { prisma } from '~/lib/prisma'
import { PatchProfileInput, RegisterUserDto } from '~/modules/users/user.types'

export const UserRepo = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email
      },
      include: { role: true },
    })
  },

  async setActive(email: string, isActive: boolean) {
    return prisma.user.update({
      where: { email },
      data: { isActive },
    })
  },

  async create(data: RegisterUserDto, isActive = false) {
    // default role is user
    const res = await prisma.user.create({
      data: {
        ...data,
        isActive,
        role: {
          connectOrCreate: {
            where: { name: 'USER' },
            create: { name: 'USER' },
          },
        }
      },
    })
    return res
  },

  async list() {
    return prisma.user.findMany({
      omit: { password: true }
    })
  },

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
    })
  },

  /** Cập nhật thông tin profile của user đang đăng nhập. */
  async updateProfile(id: number, data: PatchProfileInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    })
  },
}
