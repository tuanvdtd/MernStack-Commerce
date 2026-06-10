import { ADMIN_CATEGORIES } from "~/mock/adminCatalog"
import type { AdminCategory } from "~/types/admin/index"
import { slugify } from "~/lib/admin/productUtils"

export const cloneDefaultCategoryCatalog = (): AdminCategory[] =>
  ADMIN_CATEGORIES.map((c) => ({ ...c }))

export const findCategoryById = (
  catalog: AdminCategory[],
  id: string
): AdminCategory | undefined => catalog.find((c) => c.id === id)

const findCategoryByName = (
  catalog: AdminCategory[],
  name: string
): AdminCategory | undefined =>
  catalog.find((c) => c.name.toLowerCase() === name.trim().toLowerCase())

/** Đảm bảo danh mục của SPU đang sửa có trong catalog (kể cả custom) */
export const mergeProductCategoryIntoCatalog = (
  catalog: AdminCategory[],
  categoryId: string,
  categoryName: string
): AdminCategory[] => {
  if (!categoryId?.trim() || !categoryName?.trim()) return catalog
  if (catalog.some((c) => c.id === categoryId)) return catalog
  return [
    ...catalog,
    {
      id: categoryId,
      name: categoryName,
      slug: slugify(categoryName),
    },
  ]
}

export const addCategory = (
  catalog: AdminCategory[],
  rawName: string
): { catalog: AdminCategory[]; category: AdminCategory } | { error: string } => {
  const name = rawName.trim()
  if (!name) return { error: "Tên danh mục không được để trống" }
  if (name.length < 2) {
    return { error: "Tên danh mục phải có ít nhất 2 ký tự" }
  }

  const existing = findCategoryByName(catalog, name)
  if (existing) {
    return { catalog, category: existing }
  }

  const slug = slugify(name)
  const baseId = `cat-${slug || "category"}`
  let id = baseId
  let suffix = 1
  while (catalog.some((c) => c.id === id)) {
    id = `${baseId}-${suffix++}`
  }

  const category: AdminCategory = { id, name, slug: slug || `category-${suffix}` }
  return { catalog: [...catalog, category], category }
}
