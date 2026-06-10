import { prisma } from '~/lib/prisma'

export const CategoryRepo = {
  async list() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
  },

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } })
  },

  async findByName(name: string) {
    return prisma.category.findUnique({ where: { name } })
  },

  async findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } })
  },

  async findBySlugConflict(slug: string) {
    return this.findBySlug(slug)
  },

  async create(name: string, slug: string) {
    return prisma.category.create({
      data: { name, slug },
    })
  },
}
