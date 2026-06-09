import { create } from 'zustand';
import type { SPU, Order, DashboardStats, AdminDiscount } from '~/types/admin/index';

interface AdminState {
  // Products
  products: SPU[];
  setProducts: (products: SPU[]) => void;
  addProduct: (product: SPU) => void;
  updateProduct: (id: string, product: Partial<SPU>) => void;
  deleteProduct: (id: string) => void;

  // Discounts
  discounts: AdminDiscount[];
  setDiscounts: (discounts: AdminDiscount[]) => void;
  addDiscount: (discount: AdminDiscount) => void;
  updateDiscount: (id: string, discount: Partial<AdminDiscount>) => void;
  deleteDiscount: (id: string) => void;
  
  // Orders
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  
  // Stats
  stats: DashboardStats | null;
  setStats: (stats: DashboardStats) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // Products
  products: [],
  setProducts: (products) => set({ products }),
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, productData) => set((state) => ({
    products: state.products.map((p) => p.id === id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p)
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id)
  })),

  // Discounts
  discounts: [],
  setDiscounts: (discounts) => set({ discounts }),
  addDiscount: (discount) => set((state) => ({
    discounts: [...state.discounts, discount]
  })),
  updateDiscount: (id, discountData) => set((state) => ({
    discounts: state.discounts.map((d) =>
      d.id === id
        ? { ...d, ...discountData, updatedAt: new Date().toISOString() }
        : d
    )
  })),
  deleteDiscount: (id) => set((state) => ({
    discounts: state.discounts.filter((d) => d.id !== id)
  })),
  
  // Orders
  orders: [],
  setOrders: (orders) => set({ orders }),
  updateOrderStatus: (id, status) => set((state) => ({
    orders: state.orders.map((o) => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o)
  })),
  
  // Stats
  stats: null,
  setStats: (stats) => set({ stats }),
}));
