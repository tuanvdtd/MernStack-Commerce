import { prisma } from '~/lib/prisma'
import { newId } from '~/utils/id'

export const OptionRepo = {
  async listWithValues() {
    return prisma.option.findMany({
      include: {
        values: {
          orderBy: { value: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })
  },

  async upsertOption(name: string) {
    return prisma.option.upsert({
      where: { name },
      create: { id: newId(), name },
      update: {},
    })
  },

  async upsertValue(optionId: string, value: string) {
    return prisma.optionValue.upsert({
      where: {
        optionId_value: { optionId, value },
      },
      create: { id: newId(), optionId, value },
      update: {},
    })
  },
}
