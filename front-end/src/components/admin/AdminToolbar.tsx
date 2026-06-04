import type { ReactNode } from "react"
import { Card, CardContent } from "~/components/ui/card"
import { cn } from "~/lib/utils"

type AdminToolbarProps = {
  children: ReactNode
  className?: string
}

export const AdminToolbar = ({ children, className }: AdminToolbarProps) => (
  <Card size="sm" className={cn("shadow-none", className)}>
    <CardContent>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center md:gap-4">
        {children}
      </div>
    </CardContent>
  </Card>
)

export const AdminToolbarSearch = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <div className={cn("md:col-span-6 lg:col-span-5", className)}>{children}</div>
)

export const AdminToolbarField = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <div className={cn("md:col-span-3 lg:col-span-3 xl:col-span-2", className)}>
    {children}
  </div>
)
