import type { ReactNode } from "react"
import { Label } from "~/components/ui/label"
import { cn } from "~/lib/utils"
import { adminWorkspaceClass } from "~/lib/admin/ui"

type AdminToolbarProps = {
  children: ReactNode
  className?: string
}

export const AdminToolbar = ({ children, className }: AdminToolbarProps) => (
  <div className={cn(adminWorkspaceClass, "p-4", className)}>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end md:gap-4">
      {children}
    </div>
  </div>
)

export const AdminToolbarSearch = ({
  children,
  label = "Search",
  className,
}: {
  children: ReactNode
  label?: string
  className?: string
}) => (
  <div className={cn("space-y-2 md:col-span-6 lg:col-span-5", className)}>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
  </div>
)

export const AdminToolbarField = ({
  children,
  label,
  className,
}: {
  children: ReactNode
  label?: string
  className?: string
}) => (
  <div
    className={cn(
      "space-y-2 md:col-span-3 lg:col-span-3 xl:col-span-2",
      className
    )}
  >
    {label && (
      <Label className="text-xs text-muted-foreground">{label}</Label>
    )}
    {children}
  </div>
)
