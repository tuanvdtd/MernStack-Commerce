import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "~/lib/utils"
import { adminDescClass } from "~/lib/admin/ui"

type AdminEmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export const AdminEmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-3 px-6 py-24 text-center",
      className
    )}
  >
    <Icon className="size-8 text-muted-foreground/60" aria-hidden strokeWidth={1.5} />
    <div className="space-y-1">
      <p className="text-[13px] font-medium text-foreground">{title}</p>
      {description && <p className={cn(adminDescClass, "max-w-xs")}>{description}</p>}
    </div>
    {action}
  </div>
)
