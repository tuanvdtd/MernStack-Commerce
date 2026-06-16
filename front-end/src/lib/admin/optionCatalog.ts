import { PRODUCT_OPTION_CATALOG } from "~/mock/adminCatalog"

export type OptionCatalogEntry = {
  name: string
  label: string
  values: string[]
}

export const cloneDefaultOptionCatalog = (): OptionCatalogEntry[] =>
  PRODUCT_OPTION_CATALOG.map((entry) => ({
    ...entry,
    values: [...entry.values],
  }))

export const findCatalogEntry = (
  catalog: OptionCatalogEntry[],
  optionName: string
): OptionCatalogEntry | undefined =>
  catalog.find((e) => e.name === optionName)

export const getCatalogLabel = (
  catalog: OptionCatalogEntry[],
  optionName: string
): string => findCatalogEntry(catalog, optionName)?.label ?? optionName

export const getCatalogValues = (
  catalog: OptionCatalogEntry[],
  optionName: string
): string[] => findCatalogEntry(catalog, optionName)?.values ?? []

/** Merge axes and values from the edited SPU into the catalog, keeping saved custom values. */
export const mergeProductIntoOptionCatalog = (
  catalog: OptionCatalogEntry[],
  product: { optionAxes?: string[]; skus: { options: { optionName: string; value: string }[] }[] }
): OptionCatalogEntry[] => {
  const next = catalog.map((e) => ({ ...e, values: [...e.values] }))

  const ensureEntry = (name: string, label?: string) => {
    let entry = next.find((e) => e.name === name)
    if (!entry) {
      entry = { name, label: label ?? name, values: [] }
      next.push(entry)
    }
    return entry
  }

  const axes =
    product.optionAxes?.length
      ? product.optionAxes
      : product.skus.flatMap((s) => s.options.map((o) => o.optionName))

  for (const axis of [...new Set(axes.filter(Boolean))]) {
    ensureEntry(axis)
  }

  for (const sku of product.skus) {
    for (const { optionName, value } of sku.options) {
      if (!optionName?.trim() || !value?.trim()) continue
      const entry = ensureEntry(optionName.trim())
      if (!entry.values.includes(value.trim())) {
        entry.values.push(value.trim())
      }
    }
  }

  return next
}

export const addCatalogOption = (
  catalog: OptionCatalogEntry[],
  rawName: string,
  rawLabel?: string
): { catalog: OptionCatalogEntry[]; name: string } | { error: string } => {
  const name = rawName.trim()
  const label = (rawLabel ?? rawName).trim()
  if (!name) return { error: "Option axis name is required" }
  if (catalog.some((e) => e.name === name)) {
    return { error: `Axis "${name}" already exists in the catalog` }
  }
  return {
    catalog: [...catalog, { name, label, values: [] }],
    name,
  }
}

export const addCatalogValue = (
  catalog: OptionCatalogEntry[],
  optionName: string,
  rawValue: string
): { catalog: OptionCatalogEntry[]; value: string } | { error: string } => {
  const value = rawValue.trim()
  if (!value) return { error: "Value is required" }

  const entry = findCatalogEntry(catalog, optionName)
  if (!entry) return { error: "Option axis does not exist in the catalog" }
  if (entry.values.includes(value)) {
    return { catalog, value }
  }

  return {
    catalog: catalog.map((e) =>
      e.name === optionName ? { ...e, values: [...e.values, value] } : e
    ),
    value,
  }
}
