import type { AdminDiscount } from "~/types/admin/index"
import { cn } from "~/lib/utils"
import {
  getDiscountDisplayStatus,
  getDiscountStatusBadgeClass,
  getDiscountStatusLabel,
} from "~/lib/admin/discountUtils"

type DiscountStatusBadgeProps = {
  discount: Pick<
    AdminDiscount,
    "isActive" | "startDate" | "endDate" | "maxUses" | "usesCount"
  >
  className?: string
}

export const DiscountStatusBadge = ({
  discount,
  className,
}: DiscountStatusBadgeProps) => {
  const status = getDiscountDisplayStatus(discount)

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium",
        getDiscountStatusBadgeClass(status),
        className
      )}
    >
      {getDiscountStatusLabel(status)}
    </span>
  )
}
