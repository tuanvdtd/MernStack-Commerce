/** Matches the Category model in Prisma. */
export interface AdminCategory {
  id: string
  name: string
  slug: string
}

/**
 * SKU variant option matching Option.name + OptionValue.value
 * through ProductVariantOptionValue.
 */
export interface VariantOption {
  optionName: string
  value: string
}

/** SKU matching the ProductVariant model. */
export interface SKU {
  id: string
  productId: string
  price: number
  imgUrl?: string
  stockQuantity: number
  options: VariantOption[]
  createdAt: string
  updatedAt: string
}

/** Gallery image stored in ProductImage. */
export interface ProductImage {
  url: string
  publicId?: string
  sortOrder: number
  alt?: string
}

/** SPU matching the Product model. */
export interface SPU {
  id: string
  name: string
  slug: string
  description: string
  categoryId: string
  categoryName: string
  brand: string
  /** Option names (variant axes); all SKUs in one SPU share this axis set. */
  optionAxes: string[]
  /** Thumbnail denormalized từ gallery[0] — ảnh đại diện listing/cart. */
  thumbnail?: string
  images: ProductImage[]
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

/** Matches the DiscountType enum in Prisma. */
export type DiscountType = "FIXED_AMOUNT" | "PERCENTAGE"

/** Matches the DiscountAppliesTo enum in Prisma. */
export type DiscountAppliesTo = "ALL" | "SPECIFIC"

/** Display status calculated from isActive, time, and usage count. */
export type DiscountDisplayStatus =
  | "active"
  | "inactive"
  | "scheduled"
  | "expired"
  | "exhausted"

/** Matches the Discount model plus the DiscountProduct relation. */
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
