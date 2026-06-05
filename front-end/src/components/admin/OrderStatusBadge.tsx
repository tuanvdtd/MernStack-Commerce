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
      "inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium",
      getOrderStatusBadgeClass(status),
      className
    )}
  >
    {getOrderStatusLabel(status)}
  </span>
)
