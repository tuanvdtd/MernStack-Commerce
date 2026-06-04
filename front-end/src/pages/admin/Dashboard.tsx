import { useEffect } from "react"
import { Link } from "react-router"
import { useAdminStore } from "~/stores/adminStore"
import { mockStats, mockProducts, mockOrders } from "~/mock/adminData"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "~/components/ui/card"
import {
  Package,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { AdminPage } from "~/components/admin/AdminPage"
import { AdminPageHeader } from "~/components/admin/AdminPageHeader"
import { AdminStatCard, AdminStatGrid } from "~/components/admin/AdminStatCard"
import { OrderStatusBadge } from "~/components/admin/OrderStatusBadge"
import { adminBrandTextClass, formatVnd } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"

export function Dashboard() {
  const { stats, setStats, setProducts, setOrders, products, orders } =
    useAdminStore()

  useEffect(() => {
    if (products.length === 0) setProducts(mockProducts)
    if (orders.length === 0) setOrders(mockOrders)
    if (!stats) setStats(mockStats)
  }, [products, orders, stats, setProducts, setOrders, setStats])

  if (!stats) return null

  const recentOrders = orders.slice(0, 5)
  const lowStockProducts = products.filter((p) => p.totalStock < 10)

  return (
    <AdminPage>
      <AdminPageHeader
        title="Dashboard"
        description="Tổng quan đơn hàng, doanh thu và tồn kho FlashBuy"
      />

      <AdminStatGrid columns={3}>
        <AdminStatCard
          label="Tổng đơn hàng"
          value={stats.totalOrders.toLocaleString("vi-VN")}
          hint="+12.5% so với tháng trước"
          icon={ShoppingCart}
        />
        <AdminStatCard
          label="Doanh thu"
          value={`${(stats.totalRevenue / 1_000_000_000).toFixed(2)}B`}
          hint="+8.2% so với tháng trước"
          icon={DollarSign}
          tone="success"
        />
        <AdminStatCard
          label="Tổng SPU"
          value={stats.totalProducts}
          icon={Package}
        />
        <AdminStatCard
          label="SPU sắp hết hàng"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          tone="warning"
        />
        <AdminStatCard
          label="Đơn chờ xử lý"
          value={stats.pendingOrders}
          icon={Clock}
          tone="warning"
        />
        <AdminStatCard
          label="Đơn hôm nay"
          value={stats.todayOrders}
          icon={TrendingUp}
          tone="brand"
        />
      </AdminStatGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="border-b">
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <CardAction>
              <Link to="/admin/orders">
                <Button variant="ghost" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-border/80 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {order.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      adminBrandTextClass
                    )}
                  >
                    {formatVnd(order.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} SP
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b">
            <CardTitle>Sản phẩm sắp hết hàng</CardTitle>
            <CardAction>
              <Link to="/admin/inventory">
                <Button variant="ghost" size="sm">
                  Xem kho
                </Button>
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {lowStockProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Không có SPU nào dưới ngưỡng tồn kho
              </p>
            ) : (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg border border-border/80 p-3"
                >
                  {product.imgUrl ? (
                    <img
                      src={product.imgUrl}
                      alt={product.name}
                      className="size-11 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="size-11 shrink-0 rounded-md bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.categoryName}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {product.totalStock}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.skus.length} SKU
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  )
}
