import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "~/lib/utils"
import { Card, CardContent } from "~/components/ui/card"

type AdminStatCardProps = {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  tone?: "default" | "brand" | "warning" | "danger" | "success"
}

const toneIconClass: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  default: "bg-muted text-muted-foreground",
  brand: "bg-[var(--admin-brand)]/15 text-[var(--admin-brand)]",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  danger: "bg-red-500/15 text-red-700 dark:text-red-300",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
}

const toneValueClass: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  default: "text-foreground",
  brand: "text-foreground",
  warning: "text-amber-700 dark:text-amber-300",
  danger: "text-red-700 dark:text-red-300",
  success: "text-emerald-700 dark:text-emerald-300",
}

export const AdminStatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: AdminStatCardProps) => (
  <Card size="sm" className="shadow-none">
    <CardContent className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "text-2xl font-semibold tabular-nums tracking-tight",
            toneValueClass[tone]
          )}
        >
          {value}
        </p>
        {hint && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
      {Icon && (
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            toneIconClass[tone]
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
      )}
    </CardContent>
  </Card>
)

export const AdminStatGrid = ({
  children,
  columns = 4,
}: {
  children: ReactNode
  columns?: 2 | 3 | 4 | 6
}) => {
  const colClass =
    columns === 6
      ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : columns === 2
          ? "sm:grid-cols-2"
          : "sm:grid-cols-2 lg:grid-cols-4"

  return (
    <div className={cn("grid grid-cols-1 gap-4", colClass)}>{children}</div>
  )
}
