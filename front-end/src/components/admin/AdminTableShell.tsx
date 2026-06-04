import type { ReactNode } from "react"
import { Card, CardContent } from "~/components/ui/card"
import { cn } from "~/lib/utils"

type AdminTableShellProps = {
  children: ReactNode
  className?: string
}

export const AdminTableShell = ({ children, className }: AdminTableShellProps) => (
  <Card className={cn("overflow-hidden py-0 shadow-none", className)}>
    <CardContent className="px-0">
      <div className="overflow-x-auto">{children}</div>
    </CardContent>
  </Card>
)
