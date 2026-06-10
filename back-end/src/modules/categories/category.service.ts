import { ApiError } from '~/core/http/ApiError'
import { CategoryRepo } from '~/modules/categories/category.repo'
import { generateCategorySlug } from '~/utils/productSlug'

export const CategoryService = {
  async list() {
    return CategoryRepo.list()
  },

  async create(name: string) {
    const trimmed = name.trim()
    const existing = await CategoryRepo.findByName(trimmed)
    if (existing) return existing

    let slug = generateCategorySlug(trimmed)
    let suffix = 1
    while (await CategoryRepo.findBySlugConflict(slug)) {
      slug = `${generateCategorySlug(trimmed)}-${suffix++}`
    }

    try {
      return await CategoryRepo.create(trimmed, slug)
    } catch {
      throw ApiError.Conflict('Category already exists')
    }
  },
}
