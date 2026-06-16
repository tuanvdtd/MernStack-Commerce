import type {
  AdminDiscount,
  DiscountDisplayStatus,
  DiscountType,
} from "~/types/admin/index"
import { formatVnd } from "~/lib/admin/ui"

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  FIXED_AMOUNT: "Fixed amount",
  PERCENTAGE: "Percentage",
}

export const DISCOUNT_APPLIES_TO_LABELS: Record<
  AdminDiscount["appliesTo"],
  string
> = {
  ALL: "Entire order",
  SPECIFIC: "Selected products",
}

export const DISCOUNT_STATUS_LABELS: Record<DiscountDisplayStatus, string> = {
  active: "Active",
  inactive: "Disabled",
  scheduled: "Scheduled",
  expired: "Expired",
  exhausted: "Fully used",
}

export const DISCOUNT_STATUS_BADGE_CLASS: Record<DiscountDisplayStatus, string> =
  {
    active: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
    inactive: "bg-muted text-muted-foreground",
    scheduled: "bg-sky-500/12 text-sky-800 dark:text-sky-200",
    expired: "bg-red-500/12 text-red-800 dark:text-red-200",
    exhausted: "bg-amber-500/12 text-amber-800 dark:text-amber-200",
  }

export const getDiscountDisplayStatus = (
  discount: Pick<
    AdminDiscount,
    "isActive" | "startDate" | "endDate" | "maxUses" | "usesCount"
  >,
  now = new Date()
): DiscountDisplayStatus => {
  if (!discount.isActive) return "inactive"
  const start = new Date(discount.startDate)
  const end = new Date(discount.endDate)
  if (now < start) return "scheduled"
  if (now > end) return "expired"
  if (discount.usesCount >= discount.maxUses) return "exhausted"
  return "active"
}

export const getDiscountStatusLabel = (status: DiscountDisplayStatus) =>
  DISCOUNT_STATUS_LABELS[status] ?? status

export const getDiscountStatusBadgeClass = (status: DiscountDisplayStatus) =>
  DISCOUNT_STATUS_BADGE_CLASS[status] ?? DISCOUNT_STATUS_BADGE_CLASS.inactive

export const formatDiscountValue = (discount: Pick<AdminDiscount, "type" | "value" | "maxValue">) => {
  if (discount.type === "PERCENTAGE") {
    return `${discount.value}% (up to ${formatVnd(discount.maxValue)})`
  }
  return formatVnd(discount.value)
}

export const formatUsageRatio = (usesCount: number, maxUses: number) =>
  `${usesCount.toLocaleString("en-US")} / ${maxUses.toLocaleString("en-US")}`

export const getUsagePercent = (usesCount: number, maxUses: number) => {
  if (maxUses <= 0) return 0
  return Math.min(100, Math.round((usesCount / maxUses) * 100))
}

/** Convert ISO dates to datetime-local input values. */
export const toDatetimeLocalValue = (iso: string) => {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Convert datetime-local input values to ISO dates. */
export const fromDatetimeLocalValue = (value: string) =>
  new Date(value).toISOString()
