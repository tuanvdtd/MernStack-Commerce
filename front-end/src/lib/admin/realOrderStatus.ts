import type { Order } from "~/apis/orderApi"

export const ORDER_STATUS_LABELS: Record<Order["orderStatus"], string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

export const ORDER_STATUS_BADGE_CLASS: Record<Order["orderStatus"], string> = {
  PENDING: "bg-amber-500/12 text-amber-800 dark:text-amber-200",
  CONFIRMED: "bg-sky-500/12 text-sky-800 dark:text-sky-200",
  SHIPPED: "bg-indigo-500/12 text-indigo-800 dark:text-indigo-200",
  DELIVERED: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
  CANCELLED: "bg-red-500/12 text-red-800 dark:text-red-200",
}

export const PAYMENT_STATUS_LABELS: Record<Order["paymentStatus"], string> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
}

// Mirrors OrderService.ORDER_STATUS_TRANSITIONS on the back end.
export const ORDER_STATUS_TRANSITIONS: Record<Order["orderStatus"], Order["orderStatus"][]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
}
