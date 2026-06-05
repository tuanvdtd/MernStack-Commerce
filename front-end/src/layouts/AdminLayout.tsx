import { Outlet, Link, useLocation } from "react-router"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  LogOut,
  Menu,
  X,
  Store,
} from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Package, label: "Sản phẩm", path: "/admin/products" },
  { icon: Warehouse, label: "Kho hàng", path: "/admin/inventory" },
  { icon: ShoppingCart, label: "Đơn hàng", path: "/admin/orders" },
] as const

const routeTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Sản phẩm",
  "/admin/inventory": "Kho hàng",
  "/admin/orders": "Đơn hàng",
}

const isNavActive = (pathname: string, path: string) => {
  if (path === "/admin") return pathname === "/admin"
  return pathname === path || pathname.startsWith(`${path}/`)
}

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith("/admin/products/")) return "Sản phẩm"
  if (pathname.startsWith("/admin/orders/")) return "Đơn hàng"
  return routeTitles[pathname] ?? "Quản trị"
}

export function AdminLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pageTitle = getPageTitle(location.pathname)

  const handleCloseSidebar = () => setSidebarOpen(false)

  return (
    <div className="admin-shell min-h-svh bg-zinc-50 text-foreground dark:bg-zinc-950">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-[1px] lg:hidden"
          aria-label="Đóng menu"
          onClick={handleCloseSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[var(--admin-sidebar-width)] flex-col border-r border-border/80 bg-background transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-[3.25rem] items-center gap-2.5 px-4">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--admin-brand)] text-[var(--admin-brand-foreground)]">
            <Store className="size-3.5" aria-hidden strokeWidth={2} />
          </div>
          <Link
            to="/admin"
            className="truncate text-[13px] font-semibold tracking-[-0.01em] text-foreground"
            onClick={handleCloseSidebar}
          >
            FlashBuy
          </Link>
        </div>

        <nav
          className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2"
          aria-label="Menu quản trị"
        >
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isNavActive(location.pathname, item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleCloseSidebar}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150",
                  active
                    ? "bg-[var(--admin-brand)]/10 text-[var(--admin-brand)]"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-4 shrink-0" aria-hidden strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border/80 p-2">
          <Link to="/" onClick={handleCloseSidebar}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start gap-2 px-2.5 text-[13px] text-muted-foreground"
            >
              <LogOut className="size-3.5" aria-hidden strokeWidth={1.75} />
              Về cửa hàng
            </Button>
          </Link>
        </div>
      </aside>

      <div className="flex min-h-svh flex-col lg:pl-[var(--admin-sidebar-width)]">
        <header className="sticky top-0 z-30 flex h-[3.25rem] shrink-0 items-center justify-between gap-4 border-b border-border/80 bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? "Đóng menu" : "Mở menu"}
            >
              {sidebarOpen ? (
                <X className="size-4" strokeWidth={1.75} />
              ) : (
                <Menu className="size-4" strokeWidth={1.75} />
              )}
            </Button>
            <p className="truncate text-[13px] text-muted-foreground">
              <span className="hidden sm:inline">Quản trị / </span>
              <span className="font-medium text-foreground">{pageTitle}</span>
            </p>
          </div>
          <Link to="/" className="sm:hidden">
            <Button variant="ghost" size="sm" className="h-8 text-[13px]">
              Về cửa hàng
            </Button>
          </Link>
        </header>

        <main className="w-full flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
