import type { Order } from "~/types/admin/index"

export const adminBrandButtonClass =
  "bg-[var(--admin-brand)] text-[var(--admin-brand-foreground)] hover:brightness-95 active:scale-[0.98] transition-[transform,filter] duration-150"

export const adminBrandTextClass = "text-[var(--admin-brand)]"

export const adminTitleClass =
  "text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] text-foreground"

export const adminDescClass = "text-[13px] leading-relaxed text-muted-foreground"

export const adminMetricLabelClass = "text-[13px] text-muted-foreground"

export const adminMetricValueClass =
  "font-mono text-xl font-medium tabular-nums tracking-tight text-foreground"

export const adminThClass =
  "h-9 px-4 text-left align-middle text-[11px] font-medium text-muted-foreground whitespace-nowrap"

export const adminTdClass = "px-4 py-2.5 align-middle text-[13px] text-foreground"

export const adminMonoClass = "font-mono text-[13px] tabular-nums text-muted-foreground"

export const adminGhostButtonClass =
  "transition-[transform,background-color] duration-150 active:scale-[0.98]"

export const adminWorkspaceClass =
  "overflow-hidden rounded-2xl border border-border/70 bg-background shadow-[0_1px_2px_oklch(0_0_0/0.04)]"

export const adminDividerClass = "border-border/60"

export const adminFilterBarClass =
  "bg-zinc-100/80 px-5 py-4 dark:bg-zinc-900/40 lg:px-6"

export const adminFilterLabelClass =
  "mb-1.5 block text-[12px] font-medium text-foreground"

export const adminFilterInputClass =
  "h-10 border-border/80 bg-background text-[13px] shadow-sm focus-visible:border-[var(--admin-brand)]/50 focus-visible:ring-2 focus-visible:ring-[var(--admin-brand)]/20"

export const adminRowActionClass =
  "inline-flex items-center gap-1"

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
  pending: "bg-amber-500/12 text-amber-800 dark:text-amber-200",
  confirmed: "bg-sky-500/12 text-sky-800 dark:text-sky-200",
  processing: "bg-violet-500/12 text-violet-800 dark:text-violet-200",
  shipped: "bg-indigo-500/12 text-indigo-800 dark:text-indigo-200",
  delivered: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
  cancelled: "bg-red-500/12 text-red-800 dark:text-red-200",
  refunded: "bg-muted text-muted-foreground",
}

export const formatVnd = (amount: number) => `${amount.toLocaleString("vi-VN")}đ`

export const getOrderStatusLabel = (status: Order["status"]) =>
  ORDER_STATUS_LABELS[status] ?? status

export const getOrderStatusBadgeClass = (status: Order["status"]) =>
  ORDER_STATUS_BADGE_CLASS[status] ?? ORDER_STATUS_BADGE_CLASS.pending
