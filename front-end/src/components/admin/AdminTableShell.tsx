import type { ReactNode } from "react"
import { cn } from "~/lib/utils"
import { adminWorkspaceClass } from "~/lib/admin/ui"

type AdminTableShellProps = {
  children: ReactNode
  className?: string
  footer?: ReactNode
}

export const AdminTableShell = ({
  children,
  className,
  footer,
}: AdminTableShellProps) => (
  <div className={cn(adminWorkspaceClass, "overflow-hidden", className)}>
    <div className="overflow-x-auto">{children}</div>
    {footer && (
      <div className="border-t border-border/80 bg-muted/20 px-4 py-3">
        {footer}
      </div>
    )}
  </div>
)
