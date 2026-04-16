import { Outlet, Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Warehouse,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Package, label: "Quản lý sản phẩm", path: "/admin/products" },
  { icon: Warehouse, label: "Quản lý kho", path: "/admin/inventory" },
  { icon: ShoppingCart, label: "Quản lý đơn hàng", path: "/admin/orders" },
];

export function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Link to="/admin" className="flex items-center gap-2">
              <div className="text-2xl font-bold" style={{ color: "#0ACDFF" }}>
                FlashBuy
              </div>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-gray-600">
              Xin chào, <span className="font-semibold">Admin</span>
            </div>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Về trang chủ</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform bg-white border-r border-gray-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <nav className="space-y-1 mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#0ACDFF]/10 text-[#0ACDFF] font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64">
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
