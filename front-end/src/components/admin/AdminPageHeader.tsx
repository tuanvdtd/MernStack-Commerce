import type { ReactNode } from "react"
import { cn } from "~/lib/utils"

type AdminPageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  leading?: ReactNode
  meta?: ReactNode
  className?: string
  /** Compact title for narrow form pages (e.g. product editor). */
  size?: "default" | "compact"
}

export const AdminPageHeader = ({
  title,
  description,
  actions,
  leading,
  meta,
  className,
  size = "default",
}: AdminPageHeaderProps) => (
  <div className={cn(size === "compact" ? "space-y-3" : "space-y-4", className)}>
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        size === "compact" && "sm:gap-4"
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
        {leading}
        <div className="min-w-0 space-y-1">
          <h1
            className={cn(
              "font-heading font-semibold tracking-tight text-foreground",
              size === "compact"
                ? "text-lg leading-snug sm:text-xl"
                : "text-2xl lg:text-[1.65rem]"
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                "max-w-prose text-muted-foreground",
                size === "compact"
                  ? "text-xs leading-relaxed"
                  : "text-sm leading-relaxed"
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
    {meta}
  </div>
)
