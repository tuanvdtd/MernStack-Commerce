import { prisma } from '~/lib/prisma'
import { newId } from '~/utils/id'
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
    const role =
      (await prisma.role.findUnique({ where: { name: 'USER' } })) ??
      (await prisma.role.create({
        data: { id: newId(), name: 'USER' },
      }))

    const res = await prisma.user.create({
      data: {
        id: newId(),
        ...data,
        isActive,
        roleId: role.id,
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
      where: { id },
      include: { role: true },
    })
  },

  /** Cập nhật thông tin profile của user đang đăng nhập. */
  async updateProfile(id: string, data: PatchProfileInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    })
  },
}
