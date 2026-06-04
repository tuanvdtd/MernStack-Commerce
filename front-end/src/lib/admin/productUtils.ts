import type { SKU, SPU, VariantOption } from "~/types/admin/index"
import {
  getCatalogLabel,
  getCatalogValues,
  type OptionCatalogEntry,
} from "~/lib/admin/optionCatalog"

export const DEFAULT_OPTION_AXES = ["Color", "Storage"] as const

export const getOptionCatalogLabel = (
  optionName: string,
  catalog: OptionCatalogEntry[]
): string => getCatalogLabel(catalog, optionName)

export const getValuesForOptionAxis = (
  optionName: string,
  catalog: OptionCatalogEntry[]
): string[] => getCatalogValues(catalog, optionName)

/** Suy ra trục từ SPU đã lưu hoặc từ SKU (sản phẩm cũ chưa có optionAxes) */
export const deriveOptionAxes = (
  product: Pick<SPU, "optionAxes" | "skus">
): string[] => {
  if (product.optionAxes?.length) return [...product.optionAxes]

  const axes: string[] = []
  const seen = new Set<string>()
  for (const sku of product.skus) {
    for (const o of sku.options) {
      if (o.optionName && !seen.has(o.optionName)) {
        seen.add(o.optionName)
        axes.push(o.optionName)
      }
    }
  }
  return axes.length > 0 ? axes : [...DEFAULT_OPTION_AXES]
}

export const alignSkuOptionsToAxes = (
  axes: string[],
  skuOptions: VariantOption[]
): VariantOption[] =>
  axes.map((optionName) => ({
    optionName,
    value: skuOptions.find((o) => o.optionName === optionName)?.value ?? "",
  }))

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export const computeProductStats = (
  skus: Pick<SKU, "price" | "stockQuantity">[]
): Pick<SPU, "totalStock" | "minPrice" | "maxPrice"> => {
  if (skus.length === 0) {
    return { totalStock: 0, minPrice: 0, maxPrice: 0 }
  }
  return {
    totalStock: skus.reduce((sum, s) => sum + s.stockQuantity, 0),
    minPrice: Math.min(...skus.map((s) => s.price)),
    maxPrice: Math.max(...skus.map((s) => s.price)),
  }
}

export const suggestSkuCode = (
  productSlug: string,
  options: VariantOption[]
): string => {
  const prefix = productSlug
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 4).toUpperCase())
    .join("")
    .slice(0, 12)

  const suffix = options
    .map((o) =>
      o.value
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 8)
    )
    .join("-")

  return [prefix || "SKU", suffix].filter(Boolean).join("-")
}

export const formatVariantOptions = (options: VariantOption[]): string =>
  options.map((o) => `${o.optionName}: ${o.value}`).join(" · ")

export interface SkuFormInput {
  sku: string
  price: number
  stockQuantity: number
  imgUrl?: string
  options: VariantOption[]
}

export const validateOptionAxes = (axes: string[]): string | null => {
  if (axes.length === 0) {
    return "SPU cần ít nhất một trục Option (VD: Màu, Bộ nhớ)"
  }
  if (new Set(axes).size !== axes.length) {
    return "Không được trùng trục Option trên SPU"
  }
  const empty = axes.find((a) => !a.trim())
  if (empty !== undefined) {
    return "Tên trục Option không được để trống"
  }
  return null
}

export const validateSkuForms = (
  skus: SkuFormInput[],
  optionAxes: string[],
  catalog: OptionCatalogEntry[],
  existingCodes: string[] = []
): string | null => {
  const axesError = validateOptionAxes(optionAxes)
  if (axesError) return axesError

  if (skus.length === 0) {
    return "Vui lòng thêm ít nhất 1 SKU (ProductVariant)"
  }

  const codes = new Set<string>()
  for (let i = 0; i < skus.length; i++) {
    const row = skus[i]
    const label = `SKU #${i + 1}`

    if (!row.sku.trim()) {
      return `${label}: Mã SKU không được để trống`
    }
    if (row.sku.length < 3) {
      return `${label}: Mã SKU phải có ít nhất 3 ký tự`
    }
    if (codes.has(row.sku) || existingCodes.includes(row.sku)) {
      return `${label}: Mã "${row.sku}" đã tồn tại`
    }
    codes.add(row.sku)

    if (row.price < 1000) {
      return `${label}: Giá bán phải từ 1.000đ trở lên`
    }
    if (row.stockQuantity < 0) {
      return `${label}: Tồn kho không được âm`
    }

    for (const axis of optionAxes) {
      const match = row.options.find((o) => o.optionName === axis)
      if (!match?.value.trim()) {
        return `${label}: Chọn giá trị cho "${getOptionCatalogLabel(axis, catalog)}"`
      }
    }
  }

  const combos = skus.map((s) =>
    optionAxes
      .map((axis) => {
        const val = s.options.find((o) => o.optionName === axis)?.value ?? ""
        return `${axis}:${val}`
      })
      .join("|")
  )
  if (new Set(combos).size !== combos.length) {
    return "Hai SKU không được có cùng tổ hợp thuộc tính"
  }

  return null
}
