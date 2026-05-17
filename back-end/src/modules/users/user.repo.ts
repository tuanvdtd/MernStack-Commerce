import { prisma } from '~/lib/prisma'
import { RegisterUserDto } from '~/modules/users/user.types'

export const UserRepo = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email
      }
    })
  },

  async setActive(email: string, isActive: boolean) {
    return prisma.user.update({
      where: { email },
      data: { isActive },
    })
  },

  async create(data: RegisterUserDto) {
    // default role is user
    const res = await prisma.user.create({
      data: {
        ...data,
        isActive: false,
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

  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id: parseInt(id)
      }
    })
  },
}
