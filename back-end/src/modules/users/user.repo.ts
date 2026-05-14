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

  async create(data: RegisterUserDto) {
    // default role is user
    const res = await prisma.user.create({
      data: {
        ...data,
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
