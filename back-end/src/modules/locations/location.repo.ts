import { prisma } from '~/lib/prisma'

export const LocationRepo = {
  async listProvinces() {
    return prisma.province.findMany({ orderBy: { name: 'asc' } })
  },

  async findProvince(code: string) {
    return prisma.province.findUnique({ where: { code } })
  },

  async listWardsByProvince(provinceCode: string) {
    return prisma.ward.findMany({ where: { provinceCode }, orderBy: { name: 'asc' } })
  },

  async findWard(code: string) {
    return prisma.ward.findUnique({ where: { code } })
  },
}
