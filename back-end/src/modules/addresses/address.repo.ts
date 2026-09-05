import { prisma } from '~/lib/prisma'
import { newId } from '~/utils/id'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

export type AddressRow = {
  label?: string
  recipientName: string
  phone: string
  provinceCode: string
  provinceName: string
  wardCode: string
  wardName: string
  detail: string
}

async function clearDefaultForUser(tx: Tx, userId: string, exceptId?: string) {
  await tx.address.updateMany({
    where: { userId, ...(exceptId ? { id: { not: exceptId } } : {}) },
    data: { isDefault: false },
  })
}

export const AddressRepo = {
  async listByUser(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    })
  },

  async findByIdForUser(id: string, userId: string) {
    return prisma.address.findFirst({ where: { id, userId } })
  },

  async countByUser(userId: string) {
    return prisma.address.count({ where: { userId } })
  },

  async create(userId: string, row: AddressRow, makeDefault: boolean) {
    return prisma.$transaction(async (tx) => {
      if (makeDefault) await clearDefaultForUser(tx, userId)
      return tx.address.create({
        data: { id: newId(), userId, isDefault: makeDefault, ...row },
      })
    })
  },

  async update(id: string, userId: string, row: Partial<AddressRow>, makeDefault?: boolean) {
    return prisma.$transaction(async (tx) => {
      if (makeDefault) await clearDefaultForUser(tx, userId, id)
      return tx.address.update({
        where: { id },
        data: {
          ...row,
          ...(makeDefault !== undefined ? { isDefault: makeDefault } : {}),
        },
      })
    })
  },

  async setAsDefault(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      await clearDefaultForUser(tx, userId, id)
      return tx.address.update({ where: { id }, data: { isDefault: true } })
    })
  },

  /** Order stores an address snapshot, not a FK, so deleting an Address never affects past orders. */
  async delete(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const address = await tx.address.delete({ where: { id } })
      if (address.isDefault) {
        const next = await tx.address.findFirst({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
        })
        if (next) {
          await tx.address.update({ where: { id: next.id }, data: { isDefault: true } })
        }
      }
      return address
    })
  },
}
