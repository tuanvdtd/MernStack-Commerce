export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface SKUVariant {
  name: string; // e.g., "Color", "Storage", "RAM"
  value: string; // e.g., "Black", "128GB", "8GB"
}

export interface SKU {
  id: string;
  sku: string; // Unique SKU code
  spuId: string; // Reference to parent SPU
  variants: SKUVariant[]; // e.g., [{ name: "Color", value: "Black" }, { name: "Storage", value: "128GB" }]
  price: number;
  originalPrice: number;
  discount: number; // Percentage
  stock: {
    available: number;
    reserved: number;
    sold: number;
  };
  images?: ProductImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SPU {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  images: ProductImage[];
  skus: SKU[];
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
  totalStock: number; // Sum of all SKU stocks
  minPrice: number; // Minimum price among SKUs
  maxPrice: number; // Maximum price among SKUs
}

export interface OrderItem {
  id: string;
  skuId: string;
  sku: string;
  productName: string;
  productImage: string;
  variants: SKUVariant[];
  price: number;
  quantity: number;
  total: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  paymentMethod: "cod" | "card" | "ewallet";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress: ShippingAddress;
  note?: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  todayOrders: number;
}
