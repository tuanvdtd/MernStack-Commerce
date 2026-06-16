import type { ReactNode } from "react"
import { SlidersHorizontal } from "lucide-react"
import { cn } from "~/lib/utils"
import {
  adminDividerClass,
  adminMetricLabelClass,
  adminMetricValueClass,
  adminTitleClass,
  adminDescClass,
  adminWorkspaceClass,
  adminFilterBarClass,
  adminFilterLabelClass,
} from "~/lib/admin/ui"

type AdminWorkspaceProps = {
  children: ReactNode
  className?: string
}

export const AdminWorkspace = ({ children, className }: AdminWorkspaceProps) => (
  <div className={cn(adminWorkspaceClass, className)}>{children}</div>
)

type AdminWorkspaceHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export const AdminWorkspaceHeader = ({
  title,
  description,
  actions,
  className,
}: AdminWorkspaceHeaderProps) => (
  <div
    className={cn(
      "flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between lg:px-6",
      `border-b ${adminDividerClass}`,
      className
    )}
  >
    <div className="min-w-0 space-y-1">
      <h1 className={adminTitleClass}>{title}</h1>
      {description && <p className={adminDescClass}>{description}</p>}
    </div>
    {actions && (
      <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
    )}
  </div>
)

export type AdminMetric = {
  label: string
  value: string | number
  tone?: "default" | "warning" | "danger" | "success" | "brand"
}

const metricToneClass: Record<NonNullable<AdminMetric["tone"]>, string> = {
  default: "text-foreground",
  brand: "text-[var(--admin-brand)]",
  warning: "text-amber-700 dark:text-amber-300",
  danger: "text-red-700 dark:text-red-300",
  success: "text-emerald-700 dark:text-emerald-300",
}

export const AdminMetricStrip = ({
  metrics,
  columns = 4,
  className,
}: {
  metrics: AdminMetric[]
  columns?: 2 | 3 | 4
  className?: string
}) => {
  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4"

  return (
    <div
      className={cn(
        "grid grid-cols-2 divide-x divide-y sm:divide-y-0",
        adminDividerClass,
        `border-b ${adminDividerClass}`,
        colClass,
        className
      )}
    >
      {metrics.map((metric) => (
        <div key={metric.label} className="px-5 py-4 lg:px-6">
          <p className={adminMetricLabelClass}>{metric.label}</p>
          <p
            className={cn(
              adminMetricValueClass,
              "mt-1",
              metricToneClass[metric.tone ?? "default"]
            )}
          >
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export const AdminFilterRow = ({
  children,
  className,
  title = "Search & filters",
}: {
  children: ReactNode
  className?: string
  title?: string
}) => (
  <div
    className={cn(
      adminFilterBarClass,
      `border-b ${adminDividerClass}`,
      className
    )}
  >
    <div className="mb-3 flex items-center gap-2">
      <SlidersHorizontal
        className="size-3.5 text-[var(--admin-brand)]"
        strokeWidth={2}
        aria-hidden
      />
      <p className="text-[13px] font-medium text-foreground">{title}</p>
    </div>
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-4">
      {children}
    </div>
  </div>
)

export const AdminFilterSearch = ({
  children,
  label = "Search",
  className,
}: {
  children: ReactNode
  label?: string
  className?: string
}) => (
  <div className={cn("min-w-0 flex-1 lg:max-w-md", className)}>
    <span className={adminFilterLabelClass}>{label}</span>
    {children}
  </div>
)

export const AdminFilterField = ({
  children,
  label,
  className,
}: {
  children: ReactNode
  label: string
  className?: string
}) => (
  <div className={cn("w-full sm:w-auto sm:min-w-[11rem]", className)}>
    <span className={adminFilterLabelClass}>{label}</span>
    {children}
  </div>
)

export const AdminWorkspaceBody = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <div className={cn("overflow-x-auto", className)}>{children}</div>
)

export const AdminWorkspaceFooter = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <div
    className={cn(
      "bg-muted/20 px-5 py-3.5 lg:px-6",
      `border-t ${adminDividerClass}`,
      className
    )}
  >
    {children}
  </div>
)
