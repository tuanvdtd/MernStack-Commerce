import type { AdminCategory } from "~/types/admin/index"

/** Danh mục mock — khớp model Category (id, name, slug) */
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
 * Tùy chọn biến thể — khớp Option + OptionValue trong seed/backend
 * Admin chọn từ catalog thay vì nhập tự do
 */
export const PRODUCT_OPTION_CATALOG: Array<{
  name: string
  label: string
  values: string[]
}> = [
  {
    name: "Color",
    label: "Màu sắc",
    values: ["Black", "White", "Silver", "Space Gray", "Titan Đen", "Titan Trắng", "Đen", "Xám", "Bạc"],
  },
  {
    name: "Storage",
    label: "Bộ nhớ",
    values: ["128GB", "256GB", "512GB", "1TB"],
  },
  {
    name: "RAM",
    label: "RAM",
    values: ["8GB", "12GB", "16GB", "36GB"],
  },
  {
    name: "Connectivity",
    label: "Kết nối",
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
