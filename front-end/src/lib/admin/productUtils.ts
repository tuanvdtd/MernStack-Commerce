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

/** Derive option axes from saved SPU data or legacy SKUs without optionAxes. */
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
    return "SPU needs at least one option axis (for example: Color, Storage)"
  }
  if (new Set(axes).size !== axes.length) {
    return "Option axes cannot be duplicated on the SPU"
  }
  const empty = axes.find((a) => !a.trim())
  if (empty !== undefined) {
    return "Option axis name is required"
  }
  return null
}

export type SkuFieldErrors = {
  sku?: string
  price?: string
  stockQuantity?: string
  options?: Partial<Record<string, string>>
}

export type SkuFormsValidationResult =
  | { ok: true }
  | { ok: false; errors: SkuFieldErrors[]; globalError?: string }

const emptySkuErrors = (count: number): SkuFieldErrors[] =>
  Array.from({ length: count }, () => ({}))

const hasSkuFieldErrors = (row: SkuFieldErrors): boolean =>
  Boolean(
    row.sku ||
      row.price ||
      row.stockQuantity ||
      (row.options && Object.keys(row.options).length > 0)
  )

export const validateSkuFormsDetailed = (
  skus: SkuFormInput[],
  optionAxes: string[],
  catalog: OptionCatalogEntry[],
  existingCodes: string[] = []
): SkuFormsValidationResult => {
  if (skus.length === 0) {
    return {
      ok: false,
      errors: [{}],
      globalError: "Please add at least 1 SKU",
    }
  }

  const errors = emptySkuErrors(skus.length)
  const codeIndices = new Map<string, number[]>()

  for (let i = 0; i < skus.length; i++) {
    const row = skus[i]
    const code = row.sku.trim()

    if (!code) {
      errors[i].sku = "SKU code is required"
    } else if (code.length < 3) {
      errors[i].sku = "SKU code must be at least 3 characters"
    } else {
      const list = codeIndices.get(code) ?? []
      list.push(i)
      codeIndices.set(code, list)
      if (existingCodes.includes(code)) {
        errors[i].sku = `Code "${code}" already exists`
      }
    }

    if (row.price < 1000) {
      errors[i].price = "Sale price must be at least 1,000 VND"
    }
    if (row.stockQuantity < 0) {
      errors[i].stockQuantity = "Stock cannot be negative"
    }

    for (const axis of optionAxes) {
      const match = row.options.find((o) => o.optionName === axis)
      if (!match?.value.trim()) {
        errors[i].options = {
          ...errors[i].options,
          [axis]: `Choose a value for "${getOptionCatalogLabel(axis, catalog)}"`,
        }
      }
    }
  }

  for (const [code, indices] of codeIndices) {
    if (indices.length > 1) {
      for (const i of indices) {
        if (!errors[i].sku) {
          errors[i].sku = `Code "${code}" is duplicated in the list`
        }
      }
    }
  }

  const comboIndices = new Map<string, number[]>()
  for (let i = 0; i < skus.length; i++) {
    const combo = optionAxes
      .map((axis) => {
        const val = skus[i].options.find((o) => o.optionName === axis)?.value ?? ""
        return `${axis}:${val}`
      })
      .join("|")
    const list = comboIndices.get(combo) ?? []
    list.push(i)
    comboIndices.set(combo, list)
  }

  let globalError: string | undefined
  for (const indices of comboIndices.values()) {
    if (indices.length > 1) {
      globalError = "Two SKUs cannot share the same attribute combination"
      break
    }
  }

  if (errors.some(hasSkuFieldErrors) || globalError) {
    return { ok: false, errors, globalError }
  }

  return { ok: true }
}

export const validateSkuForms = (
  skus: SkuFormInput[],
  optionAxes: string[],
  catalog: OptionCatalogEntry[],
  existingCodes: string[] = []
): string | null => {
  const axesError = validateOptionAxes(optionAxes)
  if (axesError) return axesError

  const result = validateSkuFormsDetailed(skus, optionAxes, catalog, existingCodes)
  if (result.ok) return null

  if (result.globalError) return result.globalError

  for (let i = 0; i < result.errors.length; i++) {
    const row = result.errors[i]
    const label = `SKU #${i + 1}`
    if (row.sku) return `${label}: ${row.sku}`
    if (row.price) return `${label}: ${row.price}`
    if (row.stockQuantity) return `${label}: ${row.stockQuantity}`
    if (row.options) {
      const first = Object.values(row.options)[0]
      if (first) return `${label}: ${first}`
    }
  }

  return "Please review the SKU details"
}
