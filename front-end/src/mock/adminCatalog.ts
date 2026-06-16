import type { AdminCategory } from "~/types/admin/index"

/** Mock categories matching the Category model (id, name, slug). */
export const ADMIN_CATEGORIES: AdminCategory[] = [
  { id: "cat-smartphone", name: "Smartphone", slug: "smartphone" },
  { id: "cat-laptop", name: "Laptop", slug: "laptop" },
  { id: "cat-tablet", name: "Tablet", slug: "tablet" },
  { id: "cat-audio", name: "Audio", slug: "audio" },
  { id: "cat-wearable", name: "Wearable", slug: "wearable" },
  { id: "cat-accessory", name: "Accessory", slug: "accessory" },
  { id: "cat-electronics", name: "Electronics", slug: "electronics" },
]

/**
 * Variant options matching Option + OptionValue from the seed/backend.
 * Admins choose from the catalog instead of typing every value manually.
 */
export const PRODUCT_OPTION_CATALOG: Array<{
  name: string
  label: string
  values: string[]
}> = [
  {
    name: "Color",
    label: "Color",
    values: ["Black", "White", "Silver", "Space Gray", "Black Titanium", "White Titanium", "Gray"],
  },
  {
    name: "Storage",
    label: "Storage",
    values: ["128GB", "256GB", "512GB", "1TB"],
  },
  {
    name: "RAM",
    label: "RAM",
    values: ["8GB", "12GB", "16GB", "36GB"],
  },
  {
    name: "Connectivity",
    label: "Connectivity",
    values: ["WiFi", "WiFi + 5G"],
  },
]

export const ADMIN_BRANDS = [
  "Apple",
  "Samsung",
  "Sony",
  "LG",
  "Xiaomi",
  "Huawei",
  "Dell",
  "HP",
  "Asus",
  "Lenovo",
] as const
