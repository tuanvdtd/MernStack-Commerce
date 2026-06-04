import type { Order } from "~/types/admin/index"
import { cn } from "~/lib/utils"
import {
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
} from "~/lib/admin/ui"

type OrderStatusBadgeProps = {
  status: Order["status"]
  className?: string
}

export const OrderStatusBadge = ({ status, className }: OrderStatusBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      getOrderStatusBadgeClass(status),
      className
    )}
  >
    {getOrderStatusLabel(status)}
  </span>
)
