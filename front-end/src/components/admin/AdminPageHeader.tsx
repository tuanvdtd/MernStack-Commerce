import type { ReactNode } from "react"
import { cn } from "~/lib/utils"

type AdminPageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  leading?: ReactNode
  className?: string
}

export const AdminPageHeader = ({
  title,
  description,
  actions,
  leading,
  className,
}: AdminPageHeaderProps) => (
  <div
    className={cn(
      "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
      className
    )}
  >
    <div className="flex min-w-0 flex-1 items-start gap-3">
      {leading}
      <div className="min-w-0 space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
    {actions && (
      <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
    )}
  </div>
)
