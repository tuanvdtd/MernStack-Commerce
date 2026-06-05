import type { ReactNode } from "react"
import { cn } from "~/lib/utils"

type AdminPageProps = {
  children: ReactNode
  className?: string
}

export const AdminPage = ({ children, className }: AdminPageProps) => (
  <div className={cn("flex flex-col gap-6 lg:gap-7", className)}>{children}</div>
)
