import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "~/lib/utils"
import { adminMonoClass } from "~/lib/admin/ui"

type AdminStatCardProps = {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  tone?: "default" | "brand" | "warning" | "danger" | "success"
}

const toneAccentClass: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  default: "border-l-border",
  brand: "border-l-[var(--admin-brand)]",
  warning: "border-l-amber-500/70",
  danger: "border-l-red-500/70",
  success: "border-l-emerald-500/70",
}

const toneIconClass: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  default: "bg-muted text-muted-foreground",
  brand: "bg-[var(--admin-brand)]/12 text-[var(--admin-brand)]",
  warning: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  danger: "bg-red-500/12 text-red-700 dark:text-red-300",
  success: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
}

const toneValueClass: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  default: "text-foreground",
  brand: "text-foreground",
  warning: "text-amber-800 dark:text-amber-200",
  danger: "text-red-800 dark:text-red-200",
  success: "text-emerald-800 dark:text-emerald-200",
}

export const AdminStatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: AdminStatCardProps) => (
  <div
    className={cn(
      "admin-panel flex items-center justify-between gap-4 border-l-[3px] px-4 py-4 transition-colors duration-200 hover:bg-muted/20",
      toneAccentClass[tone]
    )}
  >
    <div className="min-w-0 space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-2xl font-semibold tracking-tight",
          adminMonoClass,
          toneValueClass[tone]
        )}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
    {Icon && (
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          toneIconClass[tone]
        )}
      >
        <Icon className="size-4" aria-hidden strokeWidth={1.75} />
      </div>
    )}
  </div>
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
    <div className={cn("grid grid-cols-1 gap-3", colClass)}>{children}</div>
  )
}
