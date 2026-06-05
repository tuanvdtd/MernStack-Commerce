import { cn } from "~/lib/utils"
import { adminWorkspaceClass, adminDividerClass } from "~/lib/admin/ui"

type AdminTableSkeletonProps = {
  rows?: number
  className?: string
}

export const AdminTableSkeleton = ({
  rows = 8,
  className,
}: AdminTableSkeletonProps) => (
  <div className={cn(adminWorkspaceClass, "overflow-hidden", className)} aria-hidden>
    <div className={cn("px-5 py-5 lg:px-6", `border-b ${adminDividerClass}`)}>
      <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted/70" />
    </div>
    <div className={cn("grid grid-cols-2 sm:grid-cols-4", `border-b ${adminDividerClass}`)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2 px-5 py-4 lg:px-6">
          <div className="h-3 w-16 animate-pulse rounded bg-muted/70" />
          <div className="h-6 w-10 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
    <div className={cn("px-5 py-3 lg:px-6", `border-b ${adminDividerClass}`)}>
      <div className="h-9 w-full max-w-md animate-pulse rounded-lg bg-muted/60" />
    </div>
    <div className={cn("divide-y", adminDividerClass)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3 lg:px-6">
          <div className="size-9 shrink-0 animate-pulse rounded-lg bg-muted/60" />
          <div className="h-4 flex-1 max-w-xs animate-pulse rounded bg-muted/60" />
          <div className="hidden h-4 w-20 animate-pulse rounded bg-muted/40 sm:block" />
          <div className="hidden h-4 w-16 animate-pulse rounded bg-muted/40 md:block" />
        </div>
      ))}
    </div>
  </div>
)
