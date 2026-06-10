import { OptionRepo } from '~/modules/options/option.repo'

const DEFAULT_OPTIONS = [
  {
    name: 'Color',
    label: 'Màu sắc',
    values: ['Black', 'White', 'Silver', 'Space Gray'],
  },
  {
    name: 'Storage',
    label: 'Bộ nhớ',
    values: ['128GB', '256GB', '512GB', '1TB'],
  },
] as const

async function ensureDefaultOptions() {
  for (const entry of DEFAULT_OPTIONS) {
    const option = await OptionRepo.upsertOption(entry.name)
    for (const value of entry.values) {
      await OptionRepo.upsertValue(option.id, value)
    }
  }
}

export const OptionService = {
  async listCatalog() {
    await ensureDefaultOptions()

    const options = await OptionRepo.listWithValues()
    return options.map((option) => ({
      name: option.name,
      label: option.name,
      values: option.values.map((v) => v.value),
    }))
  },
}
