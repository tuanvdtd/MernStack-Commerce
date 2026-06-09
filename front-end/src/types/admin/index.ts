/** Khớp model Category trong Prisma */
export interface AdminCategory {
  id: string
  name: string
  slug: string
}

/**
 * Biến thể SKU — khớp Option.name + OptionValue.value
 * qua bảng ProductVariantOptionValue
 */
export interface VariantOption {
  optionName: string
  value: string
}

/** SKU — khớp model ProductVariant */
export interface SKU {
  id: string
  productId: string
  sku: string
  price: number
  imgUrl?: string
  stockQuantity: number
  options: VariantOption[]
  createdAt: string
  updatedAt: string
}

/** SPU — khớp model Product */
export interface SPU {
  id: string
  name: string
  slug: string
  description: string
  categoryId: string
  categoryName: string
  brand: string
  /** Tên Option (trục biến thể) — mọi SKU cùng SPU dùng chung bộ trục này */
  optionAxes: string[]
  imgUrl?: string
  isActive: boolean
  skus: SKU[]
  createdAt: string
  updatedAt: string
  totalStock: number
  minPrice: number
  maxPrice: number
}

export interface OrderItem {
  id: string
  skuId: string
  sku: string
  productName: string
  productImage: string
  variants: VariantOption[]
  price: number
  quantity: number
  total: number
}

export interface ShippingAddress {
  fullName: string
  phone: string
  address: string
  ward: string
  district: string
  city: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  paymentMethod: "cod" | "card" | "ewallet"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  shippingAddress: ShippingAddress
  note?: string
  createdAt: string
  updatedAt: string
  trackingNumber?: string
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  lowStockProducts: number
  pendingOrders: number
  todayOrders: number
}

/** Khớp enum DiscountType trong Prisma */
export type DiscountType = "FIXED_AMOUNT" | "PERCENTAGE"

/** Khớp enum DiscountAppliesTo trong Prisma */
export type DiscountAppliesTo = "ALL" | "SPECIFIC"

/** Trạng thái hiển thị tính từ isActive + thời gian + lượt dùng */
export type DiscountDisplayStatus =
  | "active"
  | "inactive"
  | "scheduled"
  | "expired"
  | "exhausted"

/** Khớp model Discount + quan hệ DiscountProduct */
export interface AdminDiscount {
  id: string
  name: string
  description: string
  type: DiscountType
  value: number
  maxValue: number
  code: string
  startDate: string
  endDate: string
  maxUses: number
  usesCount: number
  maxUsesPerUser: number
  minOrderValue: number
  isActive: boolean
  appliesTo: DiscountAppliesTo
  productIds: string[]
  createdAt: string
  updatedAt: string
}
