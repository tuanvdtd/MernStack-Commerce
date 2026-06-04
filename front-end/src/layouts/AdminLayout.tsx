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

const isNavActive = (pathname: string, path: string) => {
  if (path === "/admin") return pathname === "/admin"
  return pathname === path || pathname.startsWith(`${path}/`)
}

export function AdminLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleCloseSidebar = () => setSidebarOpen(false)

  return (
    <div className="admin-shell min-h-svh bg-muted/30 text-foreground">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] lg:hidden"
          aria-label="Đóng menu"
          onClick={handleCloseSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[var(--admin-sidebar-width)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
          <div
            className="flex size-8 items-center justify-center rounded-lg text-[var(--admin-brand-foreground)]"
            style={{ backgroundColor: "var(--admin-brand)" }}
          >
            <Store className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 leading-tight">
            <Link
              to="/admin"
              className="block truncate font-heading text-sm font-semibold tracking-tight"
              onClick={handleCloseSidebar}
            >
              FlashBuy
            </Link>
            <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
              Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Menu quản trị">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isNavActive(location.pathname, item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleCloseSidebar}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--admin-brand)]/12 text-[var(--admin-brand)]"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Link to="/" onClick={handleCloseSidebar}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground"
            >
              <LogOut className="size-4" aria-hidden />
              Về cửa hàng
            </Button>
          </Link>
        </div>
      </aside>

      <div className="flex min-h-svh flex-col lg:pl-[var(--admin-sidebar-width)]">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? "Đóng menu" : "Mở menu"}
            >
              {sidebarOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </Button>
            <p className="hidden text-sm text-muted-foreground sm:block">
              Xin chào,{" "}
              <span className="font-medium text-foreground">Admin</span>
            </p>
          </div>
          <Link to="/" className="sm:hidden">
            <Button variant="ghost" size="sm">
              Về cửa hàng
            </Button>
          </Link>
        </header>

        <main className="admin-main mx-auto w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
