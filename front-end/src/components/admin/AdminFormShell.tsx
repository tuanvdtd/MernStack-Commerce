import type { ReactNode } from "react"
import { adminFormLayoutClass, adminFormShellClass } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"

type AdminFormShellProps = {
  children: ReactNode
  className?: string
}

/** Centered max-width container for Shopify-style admin forms. */
export const AdminFormShell = ({ children, className }: AdminFormShellProps) => (
  <div className={cn(adminFormShellClass, className)}>{children}</div>
)

type AdminFormLayoutProps = {
  main: ReactNode
  sidebar?: ReactNode
  className?: string
}

/** Two-column product form layout: main stack + sticky sidebar on lg+. */
export const AdminFormLayout = ({
  main,
  sidebar,
  className,
}: AdminFormLayoutProps) => (
  <div className={cn(adminFormLayoutClass, className)}>
    <div className="min-w-0 space-y-3 sm:space-y-4">{main}</div>
    {sidebar ? sidebar : null}
  </div>
)
