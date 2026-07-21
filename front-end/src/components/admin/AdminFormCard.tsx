import type { ReactNode } from "react"
import { cn } from "~/lib/utils"
import { adminFormSectionTitleClass } from "~/lib/admin/ui"

type AdminFormCardProps = {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  padding?: boolean
}

/** Shopify-style section card for admin forms. */
export const AdminFormCard = ({
  title,
  action,
  children,
  className,
  bodyClassName,
  padding = true,
}: AdminFormCardProps) => (
  <section
    className={cn(
      "overflow-hidden rounded-xl border border-border/70 bg-[var(--admin-section-bg)] shadow-[0_1px_2px_oklch(0_0_0/0.04)] admin-form-card",
      className
    )}
  >
    {title ? (
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3 py-3 sm:px-4">
        <h2 className={adminFormSectionTitleClass}>{title}</h2>
        {action}
      </div>
    ) : null}
    <div
      className={cn(
        padding && "px-3 py-3 sm:px-4 sm:py-4",
        bodyClassName
      )}
    >
      {children}
    </div>
  </section>
)
