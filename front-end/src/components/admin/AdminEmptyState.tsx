import type { LucideIcon } from "lucide-react"
import { cn } from "~/lib/utils"

type AdminEmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export const AdminEmptyState = ({
  icon: Icon,
  title,
  description,
  className,
}: AdminEmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-2 py-16 text-center",
      className
    )}
  >
    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
      <Icon className="size-6 text-muted-foreground" aria-hidden />
    </div>
    <p className="text-sm font-medium text-foreground">{title}</p>
    {description && (
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    )}
  </div>
)
