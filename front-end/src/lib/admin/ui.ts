import type { Order } from "~/types/admin/index"

export const adminBrandButtonClass =
  "bg-[var(--admin-brand)] text-[var(--admin-brand-foreground)] hover:opacity-90 shadow-sm"

export const adminBrandTextClass = "text-[var(--admin-brand)]"

export const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipped: "Đã giao vận",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
}

export const ORDER_STATUS_BADGE_CLASS: Record<Order["status"], string> = {
  pending: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  confirmed: "bg-blue-500/15 text-blue-800 dark:text-blue-200",
  processing: "bg-violet-500/15 text-violet-800 dark:text-violet-200",
  shipped: "bg-indigo-500/15 text-indigo-800 dark:text-indigo-200",
  delivered: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
  cancelled: "bg-red-500/15 text-red-800 dark:text-red-200",
  refunded: "bg-muted text-muted-foreground",
}

export const formatVnd = (amount: number) => `${amount.toLocaleString("vi-VN")}đ`

export const getOrderStatusLabel = (status: Order["status"]) =>
  ORDER_STATUS_LABELS[status] ?? status

export const getOrderStatusBadgeClass = (status: Order["status"]) =>
  ORDER_STATUS_BADGE_CLASS[status] ?? ORDER_STATUS_BADGE_CLASS.pending
