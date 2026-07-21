import { Outlet, Link, useLocation } from "react-router"
import { ScrollToTop } from "~/components/ScrollToTop"
import { AdminAccountMenu } from "~/components/admin/AdminAccountMenu"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Ticket,
  Warehouse,
  LogOut,
  Menu,
  X,
  Store,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { Button } from "~/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { LogOutConfirmDialog } from "~/components/LogOutConfirmDialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { useLogOutConfirm } from "~/hooks/useLogOutConfirm"
import { userStore } from "~/stores/userStore"
import { getUserInitials } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: Warehouse, label: "Inventory", path: "/admin/inventory" },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
  { icon: Ticket, label: "Discounts", path: "/admin/discounts" },
] as const

const routeTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/inventory": "Inventory",
  "/admin/orders": "Orders",
  "/admin/discounts": "Discounts",
}

const isNavActive = (pathname: string, path: string) => {
  if (path === "/admin") return pathname === "/admin"
  return pathname === path || pathname.startsWith(`${path}/`)
}

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith("/admin/products/")) return "Products"
  if (pathname.startsWith("/admin/orders/")) return "Orders"
  if (pathname.startsWith("/admin/discounts/")) return "Discounts"
  return routeTitles[pathname] ?? "Admin"
}

function SidebarTooltip({
  label,
  collapsed,
  children,
}: {
  label: string
  collapsed: boolean
  children: ReactNode
}) {
  if (!collapsed) return children

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export function AdminLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
  })
  const pageTitle = getPageTitle(location.pathname)
  const user = userStore((s) => s.user)
  const { open, setOpen, requestLogOut, confirmLogOut } = useLogOutConfirm()

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed))
  }, [sidebarCollapsed])

  const handleCloseSidebar = () => setSidebarOpen(false)

  const toggleSidebarCollapsed = () => setSidebarCollapsed((prev) => !prev)

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "admin-shell min-h-svh text-foreground",
          sidebarCollapsed && "admin-sidebar-collapsed"
        )}
      >
        <ScrollToTop />
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-[1px] lg:hidden"
            aria-label="Close menu"
            onClick={handleCloseSidebar}
          />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[var(--admin-sidebar-width)] flex-col border-r border-zinc-200/90 bg-white text-foreground shadow-[2px_0_12px_-2px_rgba(0,0,0,0.08)] transition-[width,transform] duration-200 lg:translate-x-0 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div
            className={cn(
              "flex h-[3.25rem] shrink-0 items-center border-b border-zinc-200/90 dark:border-zinc-800/80",
              sidebarCollapsed ? "justify-center px-2" : "px-3"
            )}
          >
            <Link
              to="/admin"
              className={cn(
                "flex min-w-0 items-center gap-2.5",
                sidebarCollapsed && "justify-center"
              )}
              onClick={handleCloseSidebar}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-brand)] text-[var(--admin-brand-foreground)] shadow-sm">
                <Store className="size-4" aria-hidden strokeWidth={2} />
              </div>
              {!sidebarCollapsed && (
                <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                  FlashBuy
                </span>
              )}
            </Link>
          </div>

          <nav
            className="flex-1 space-y-1 overflow-y-auto px-2 py-3"
            aria-label="Admin menu"
          >
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isNavActive(location.pathname, item.path)

              const link = (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleCloseSidebar}
                  className={cn(
                    "flex items-center rounded-lg text-[13px] font-medium transition-colors duration-150",
                    sidebarCollapsed
                      ? "justify-center px-2 py-2.5"
                      : "gap-2.5 px-2.5 py-2",
                    active
                      ? "bg-[var(--admin-brand)]/12 text-[var(--admin-brand)] shadow-[inset_3px_0_0_0_var(--admin-brand)]"
                      : "text-muted-foreground hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-4 shrink-0" aria-hidden strokeWidth={1.75} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )

              return (
                <SidebarTooltip
                  key={item.path}
                  label={item.label}
                  collapsed={sidebarCollapsed}
                >
                  {link}
                </SidebarTooltip>
              )
            })}
          </nav>

          <div className="space-y-0.5 border-t border-zinc-200/90 p-2 dark:border-zinc-800/80">
            {user && !sidebarCollapsed && (
              <div className="flex items-center gap-2.5 rounded-lg border border-zinc-100 bg-zinc-50 px-2.5 py-2 dark:border-zinc-800 dark:bg-zinc-800/50">
                <Avatar className="size-7 shrink-0 ring-2 ring-white dark:ring-zinc-700">
                  <AvatarImage src={user.profilePic} alt={user.name} />
                  <AvatarFallback className="bg-[var(--admin-brand)]/10 text-[10px] text-[var(--admin-brand)]">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
            {user && sidebarCollapsed && (
              <SidebarTooltip label={user.name} collapsed>
                <div className="flex justify-center py-1">
                  <Avatar className="size-8 ring-2 ring-zinc-100 dark:ring-zinc-700">
                    <AvatarImage src={user.profilePic} alt={user.name} />
                    <AvatarFallback className="bg-[var(--admin-brand)]/10 text-[10px] text-[var(--admin-brand)]">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </SidebarTooltip>
            )}
            {/* <SidebarTooltip label="Back to store" collapsed={sidebarCollapsed}>
              <Link to="/" onClick={handleCloseSidebar}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-full text-[13px] text-muted-foreground hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                    sidebarCollapsed
                      ? "justify-center px-2"
                      : "justify-start gap-2 px-2.5"
                  )}
                >
                  <Home className="size-3.5 shrink-0" aria-hidden strokeWidth={1.75} />
                  {!sidebarCollapsed && "Back to store"}
                </Button>
              </Link>
            </SidebarTooltip> */}
            {user && (
              <SidebarTooltip label="Log out" collapsed={sidebarCollapsed}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-full text-[13px] text-destructive hover:bg-destructive/10 hover:text-destructive",
                    sidebarCollapsed
                      ? "justify-center px-2"
                      : "justify-start gap-2 px-2.5"
                  )}
                  onClick={() => {
                    handleCloseSidebar()
                    requestLogOut()
                  }}
                >
                  <LogOut className="size-3.5 shrink-0" aria-hidden strokeWidth={1.75} />
                  {!sidebarCollapsed && "Log out"}
                </Button>
              </SidebarTooltip>
            )}
          </div>
        </aside>

        <div className="flex min-h-svh flex-col transition-[padding] duration-200 lg:pl-[var(--admin-sidebar-width)]">
          <header className="sticky top-0 z-30 flex h-[3.25rem] shrink-0 items-center justify-between gap-4 border-b border-border/80 bg-background/90 px-4 shadow-sm backdrop-blur-md sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen((open) => !open)}
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              >
                {sidebarOpen ? (
                  <X className="size-4" strokeWidth={1.75} />
                ) : (
                  <Menu className="size-4" strokeWidth={1.75} />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="hidden text-muted-foreground lg:inline-flex"
                onClick={toggleSidebarCollapsed}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="size-4" strokeWidth={1.75} />
                ) : (
                  <PanelLeftClose className="size-4" strokeWidth={1.75} />
                )}
              </Button>
              <p className="truncate text-[13px] text-muted-foreground">
                <span className="hidden sm:inline">Admin / </span>
                <span className="font-medium text-foreground">{pageTitle}</span>
              </p>
            </div>
            <AdminAccountMenu />
          </header>

          <main className="w-full flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <Outlet />
          </main>
        </div>

        <LogOutConfirmDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={confirmLogOut}
        />
      </div>
    </TooltipProvider>
  )
}
