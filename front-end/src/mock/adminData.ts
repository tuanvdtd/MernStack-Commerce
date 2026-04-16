import type { SPU, Order, DashboardStats } from '~/types/admin/index';

export const mockProducts: SPU[] = [
  {
    id: "spu-1",
    name: "iPhone 15 Pro Max",
    description: "iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP, màn hình Super Retina XDR 6.7 inch và khung Titan cao cấp.",
    category: "Smartphone",
    brand: "Apple",
    images: [
      { id: "img-1", url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800", alt: "iPhone 15 Pro Max", isPrimary: true },
      { id: "img-2", url: "https://images.unsplash.com/photo-1695048064205-98b735a0836f?w=800", alt: "iPhone 15 Pro Max back", isPrimary: false }
    ],
    skus: [
      {
        id: "sku-1",
        sku: "IP15PM-BK-256",
        spuId: "spu-1",
        variants: [
          { name: "Màu sắc", value: "Titan Đen" },
          { name: "Bộ nhớ", value: "256GB" }
        ],
        price: 29990000,
        originalPrice: 34990000,
        discount: 14,
        stock: { available: 45, reserved: 5, sold: 150 },
        isActive: true,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-04-10T15:30:00Z"
      },
      {
        id: "sku-2",
        sku: "IP15PM-BK-512",
        spuId: "spu-1",
        variants: [
          { name: "Màu sắc", value: "Titan Đen" },
          { name: "Bộ nhớ", value: "512GB" }
        ],
        price: 34990000,
        originalPrice: 39990000,
        discount: 13,
        stock: { available: 28, reserved: 2, sold: 90 },
        isActive: true,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-04-10T15:30:00Z"
      },
      {
        id: "sku-3",
        sku: "IP15PM-WT-256",
        spuId: "spu-1",
        variants: [
          { name: "Màu sắc", value: "Titan Trắng" },
          { name: "Bộ nhớ", value: "256GB" }
        ],
        price: 29990000,
        originalPrice: 34990000,
        discount: 14,
        stock: { available: 8, reserved: 1, sold: 120 },
        isActive: true,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-04-10T15:30:00Z"
      }
    ],
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-04-10T15:30:00Z",
    totalStock: 81,
    minPrice: 29990000,
    maxPrice: 34990000
  },
  {
    id: "spu-2",
    name: "Samsung Galaxy S24 Ultra",
    description: "Galaxy S24 Ultra với chip Snapdragon 8 Gen 3, camera AI 200MP, bút S Pen tích hợp và màn hình Dynamic AMOLED 2X 6.8 inch.",
    category: "Smartphone",
    brand: "Samsung",
    images: [
      { id: "img-3", url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800", alt: "Samsung Galaxy S24 Ultra", isPrimary: true }
    ],
    skus: [
      {
        id: "sku-4",
        sku: "S24U-BK-256",
        spuId: "spu-2",
        variants: [
          { name: "Màu sắc", value: "Đen" },
          { name: "Bộ nhớ", value: "256GB" },
          { name: "RAM", value: "12GB" }
        ],
        price: 26990000,
        originalPrice: 29990000,
        discount: 10,
        stock: { available: 35, reserved: 3, sold: 85 },
        isActive: true,
        createdAt: "2024-02-01T10:00:00Z",
        updatedAt: "2024-04-12T14:20:00Z"
      },
      {
        id: "sku-5",
        sku: "S24U-GY-512",
        spuId: "spu-2",
        variants: [
          { name: "Màu sắc", value: "Xám" },
          { name: "Bộ nhớ", value: "512GB" },
          { name: "RAM", value: "12GB" }
        ],
        price: 31990000,
        originalPrice: 34990000,
        discount: 9,
        stock: { available: 22, reserved: 2, sold: 60 },
        isActive: true,
        createdAt: "2024-02-01T10:00:00Z",
        updatedAt: "2024-04-12T14:20:00Z"
      }
    ],
    status: "active",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-04-12T14:20:00Z",
    totalStock: 57,
    minPrice: 26990000,
    maxPrice: 31990000
  },
  {
    id: "spu-3",
    name: "MacBook Pro 16 inch M3 Max",
    description: "MacBook Pro 16 inch với chip M3 Max, hiệu năng đỉnh cao cho công việc chuyên nghiệp, màn hình Liquid Retina XDR.",
    category: "Laptop",
    brand: "Apple",
    images: [
      { id: "img-4", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", alt: "MacBook Pro", isPrimary: true }
    ],
    skus: [
      {
        id: "sku-6",
        sku: "MBP16-M3MAX-SG-512",
        spuId: "spu-3",
        variants: [
          { name: "Màu sắc", value: "Space Gray" },
          { name: "Chip", value: "M3 Max" },
          { name: "RAM", value: "36GB" },
          { name: "Ổ cứng", value: "512GB SSD" }
        ],
        price: 89990000,
        originalPrice: 99990000,
        discount: 10,
        stock: { available: 5, reserved: 0, sold: 25 },
        isActive: true,
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-04-08T11:15:00Z"
      },
      {
        id: "sku-7",
        sku: "MBP16-M3MAX-SG-1TB",
        spuId: "spu-3",
        variants: [
          { name: "Màu sắc", value: "Space Gray" },
          { name: "Chip", value: "M3 Max" },
          { name: "RAM", value: "36GB" },
          { name: "Ổ cứng", value: "1TB SSD" }
        ],
        price: 99990000,
        originalPrice: 109990000,
        discount: 9,
        stock: { available: 3, reserved: 1, sold: 18 },
        isActive: true,
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-04-08T11:15:00Z"
      }
    ],
    status: "active",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-04-08T11:15:00Z",
    totalStock: 8,
    minPrice: 89990000,
    maxPrice: 99990000
  },
  {
    id: "spu-4",
    name: "Sony WH-1000XM5",
    description: "Tai nghe chống ồn cao cấp Sony WH-1000XM5 với công nghệ AI, chất lượng âm thanh tuyệt vời và thời lượng pin 30 giờ.",
    category: "Audio",
    brand: "Sony",
    images: [
      { id: "img-5", url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800", alt: "Sony WH-1000XM5", isPrimary: true }
    ],
    skus: [
      {
        id: "sku-8",
        sku: "SONY-XM5-BK",
        spuId: "spu-4",
        variants: [
          { name: "Màu sắc", value: "Đen" }
        ],
        price: 7990000,
        originalPrice: 9990000,
        discount: 20,
        stock: { available: 120, reserved: 8, sold: 280 },
        isActive: true,
        createdAt: "2024-03-01T10:00:00Z",
        updatedAt: "2024-04-14T09:45:00Z"
      },
      {
        id: "sku-9",
        sku: "SONY-XM5-SL",
        spuId: "spu-4",
        variants: [
          { name: "Màu sắc", value: "Bạc" }
        ],
        price: 7990000,
        originalPrice: 9990000,
        discount: 20,
        stock: { available: 95, reserved: 5, sold: 210 },
        isActive: true,
        createdAt: "2024-03-01T10:00:00Z",
        updatedAt: "2024-04-14T09:45:00Z"
      }
    ],
    status: "active",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-04-14T09:45:00Z",
    totalStock: 215,
    minPrice: 7990000,
    maxPrice: 7990000
  },
  {
    id: "spu-5",
    name: "iPad Pro 12.9 inch M2",
    description: "iPad Pro với chip M2, màn hình Liquid Retina XDR mini-LED 12.9 inch, hỗ trợ Apple Pencil và Magic Keyboard.",
    category: "Tablet",
    brand: "Apple",
    images: [
      { id: "img-6", url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", alt: "iPad Pro", isPrimary: true }
    ],
    skus: [
      {
        id: "sku-10",
        sku: "IPADPRO-M2-128-WIFI",
        spuId: "spu-5",
        variants: [
          { name: "Bộ nhớ", value: "128GB" },
          { name: "Kết nối", value: "WiFi" }
        ],
        price: 24990000,
        originalPrice: 29990000,
        discount: 17,
        stock: { available: 18, reserved: 2, sold: 75 },
        isActive: true,
        createdAt: "2024-02-10T10:00:00Z",
        updatedAt: "2024-04-11T16:20:00Z"
      },
      {
        id: "sku-11",
        sku: "IPADPRO-M2-256-5G",
        spuId: "spu-5",
        variants: [
          { name: "Bộ nhớ", value: "256GB" },
          { name: "Kết nối", value: "WiFi + 5G" }
        ],
        price: 32990000,
        originalPrice: 36990000,
        discount: 11,
        stock: { available: 12, reserved: 1, sold: 50 },
        isActive: true,
        createdAt: "2024-02-10T10:00:00Z",
        updatedAt: "2024-04-11T16:20:00Z"
      }
    ],
    status: "active",
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-04-11T16:20:00Z",
    totalStock: 30,
    minPrice: 24990000,
    maxPrice: 32990000
  }
];

export const mockOrders: Order[] = [
  {
    id: "order-1",
    orderNumber: "ORD-20260415-0001",
    customerId: "cust-123",
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@example.com",
    items: [
      {
        id: "item-1",
        skuId: "sku-1",
        sku: "IP15PM-BK-256",
        productName: "iPhone 15 Pro Max",
        productImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
        variants: [
          { name: "Màu sắc", value: "Titan Đen" },
          { name: "Bộ nhớ", value: "256GB" }
        ],
        price: 29990000,
        quantity: 1,
        total: 29990000
      }
    ],
    subtotal: 29990000,
    shippingFee: 30000,
    discount: 0,
    total: 30020000,
    status: "pending",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingAddress: {
      fullName: "Nguyễn Văn A",
      phone: "0901234567",
      address: "123 Nguyễn Huệ",
      ward: "Phường Bến Nghé",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh"
    },
    note: "Giao trong giờ hành chính",
    createdAt: "2026-04-15T08:30:00Z",
    updatedAt: "2026-04-15T08:30:00Z"
  },
  {
    id: "order-2",
    orderNumber: "ORD-20260415-0002",
    customerId: "cust-456",
    customerName: "Trần Thị B",
    customerEmail: "tranthib@example.com",
    items: [
      {
        id: "item-2",
        skuId: "sku-8",
        sku: "SONY-XM5-BK",
        productName: "Sony WH-1000XM5",
        productImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400",
        variants: [
          { name: "Màu sắc", value: "Đen" }
        ],
        price: 7990000,
        quantity: 2,
        total: 15980000
      },
      {
        id: "item-3",
        skuId: "sku-10",
        sku: "IPADPRO-M2-128-WIFI",
        productName: "iPad Pro 12.9 inch M2",
        productImage: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
        variants: [
          { name: "Bộ nhớ", value: "128GB" },
          { name: "Kết nối", value: "WiFi" }
        ],
        price: 24990000,
        quantity: 1,
        total: 24990000
      }
    ],
    subtotal: 40970000,
    shippingFee: 50000,
    discount: 500000,
    total: 40520000,
    status: "confirmed",
    paymentMethod: "card",
    paymentStatus: "paid",
    shippingAddress: {
      fullName: "Trần Thị B",
      phone: "0912345678",
      address: "456 Lê Lợi",
      ward: "Phường Bến Thành",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh"
    },
    createdAt: "2026-04-15T09:15:00Z",
    updatedAt: "2026-04-15T10:30:00Z"
  },
  {
    id: "order-3",
    orderNumber: "ORD-20260414-0089",
    customerId: "cust-789",
    customerName: "Lê Văn C",
    customerEmail: "levanc@example.com",
    items: [
      {
        id: "item-4",
        skuId: "sku-4",
        sku: "S24U-BK-256",
        productName: "Samsung Galaxy S24 Ultra",
        productImage: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
        variants: [
          { name: "Màu sắc", value: "Đen" },
          { name: "Bộ nhớ", value: "256GB" },
          { name: "RAM", value: "12GB" }
        ],
        price: 26990000,
        quantity: 1,
        total: 26990000
      }
    ],
    subtotal: 26990000,
    shippingFee: 30000,
    discount: 200000,
    total: 26820000,
    status: "shipped",
    paymentMethod: "ewallet",
    paymentStatus: "paid",
    shippingAddress: {
      fullName: "Lê Văn C",
      phone: "0923456789",
      address: "789 Trần Hưng Đạo",
      ward: "Phường Cầu Ông Lãnh",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh"
    },
    trackingNumber: "VNP1234567890",
    createdAt: "2026-04-14T14:20:00Z",
    updatedAt: "2026-04-15T08:00:00Z"
  },
  {
    id: "order-4",
    orderNumber: "ORD-20260414-0075",
    customerId: "cust-321",
    customerName: "Phạm Thị D",
    customerEmail: "phamthid@example.com",
    items: [
      {
        id: "item-5",
        skuId: "sku-6",
        sku: "MBP16-M3MAX-SG-512",
        productName: "MacBook Pro 16 inch M3 Max",
        productImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        variants: [
          { name: "Màu sắc", value: "Space Gray" },
          { name: "Chip", value: "M3 Max" },
          { name: "RAM", value: "36GB" },
          { name: "Ổ cứng", value: "512GB SSD" }
        ],
        price: 89990000,
        quantity: 1,
        total: 89990000
      }
    ],
    subtotal: 89990000,
    shippingFee: 0,
    discount: 1000000,
    total: 88990000,
    status: "delivered",
    paymentMethod: "card",
    paymentStatus: "paid",
    shippingAddress: {
      fullName: "Phạm Thị D",
      phone: "0934567890",
      address: "321 Võ Văn Tần",
      ward: "Phường Võ Thị Sáu",
      district: "Quận 3",
      city: "TP. Hồ Chí Minh"
    },
    trackingNumber: "VNP0987654321",
    createdAt: "2026-04-14T11:00:00Z",
    updatedAt: "2026-04-15T09:30:00Z"
  },
  {
    id: "order-5",
    orderNumber: "ORD-20260413-0156",
    customerId: "cust-654",
    customerName: "Hoàng Văn E",
    customerEmail: "hoangvane@example.com",
    items: [
      {
        id: "item-6",
        skuId: "sku-9",
        sku: "SONY-XM5-SL",
        productName: "Sony WH-1000XM5",
        productImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400",
        variants: [
          { name: "Màu sắc", value: "Bạc" }
        ],
        price: 7990000,
        quantity: 1,
        total: 7990000
      }
    ],
    subtotal: 7990000,
    shippingFee: 30000,
    discount: 0,
    total: 8020000,
    status: "cancelled",
    paymentMethod: "cod",
    paymentStatus: "failed",
    shippingAddress: {
      fullName: "Hoàng Văn E",
      phone: "0945678901",
      address: "654 Pasteur",
      ward: "Phư��ng 8",
      district: "Quận 3",
      city: "TP. Hồ Chí Minh"
    },
    note: "Khách hủy - không nhận máy",
    createdAt: "2026-04-13T16:45:00Z",
    updatedAt: "2026-04-14T10:20:00Z"
  }
];

export const mockStats: DashboardStats = {
  totalOrders: 156,
  totalRevenue: 4850000000,
  totalProducts: 5,
  lowStockProducts: 2,
  pendingOrders: 8,
  todayOrders: 12
};
