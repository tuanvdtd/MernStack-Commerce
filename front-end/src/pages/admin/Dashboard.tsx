import { useEffect } from "react"
import { Link } from "react-router"
import { useAdminStore } from "~/stores/adminStore"
import { mockStats, mockProducts, mockOrders } from "~/mock/adminData"
import { Button } from "~/components/ui/button"
import { OrderStatusBadge } from "~/components/admin/OrderStatusBadge"
import {
  AdminWorkspace,
  AdminWorkspaceHeader,
  AdminMetricStrip,
  AdminWorkspaceBody,
} from "~/components/admin/AdminWorkspace"
import { adminBrandTextClass, adminDividerClass, formatVnd } from "~/lib/admin/ui"
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
    <div className="space-y-5">
      <AdminWorkspace>
        <AdminWorkspaceHeader
          title="Dashboard"
          description="Tổng quan đơn hàng, doanh thu và tồn kho."
        />
        <AdminMetricStrip
          columns={3}
          metrics={[
            {
              label: "Tổng đơn hàng",
              value: stats.totalOrders.toLocaleString("vi-VN"),
            },
            {
              label: "Doanh thu",
              value: `${(stats.totalRevenue / 1_000_000_000).toFixed(2)}B`,
              tone: "success",
            },
            { label: "Tổng SPU", value: stats.totalProducts },
            {
              label: "SPU sắp hết",
              value: stats.lowStockProducts,
              tone: "warning",
            },
            {
              label: "Đơn chờ xử lý",
              value: stats.pendingOrders,
              tone: "warning",
            },
            {
              label: "Đơn hôm nay",
              value: stats.todayOrders,
              tone: "brand",
            },
          ]}
        />
      </AdminWorkspace>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AdminWorkspace>
          <div
            className={cn(
              "flex items-center justify-between px-5 py-4 lg:px-6",
              `border-b ${adminDividerClass}`
            )}
          >
            <h2 className="text-[13px] font-medium text-foreground">
              Đơn hàng gần đây
            </h2>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm" className="h-8 text-[13px]">
                Xem tất cả
              </Button>
            </Link>
          </div>
          <AdminWorkspaceBody>
            <div className={cn("divide-y", adminDividerClass)}>
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-muted/30 lg:px-6"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-medium">{order.orderNumber}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "font-mono text-[13px] font-medium tabular-nums",
                        adminBrandTextClass
                      )}
                    >
                      {formatVnd(order.total)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </AdminWorkspaceBody>
        </AdminWorkspace>

        <AdminWorkspace>
          <div
            className={cn(
              "flex items-center justify-between px-5 py-4 lg:px-6",
              `border-b ${adminDividerClass}`
            )}
          >
            <h2 className="text-[13px] font-medium text-foreground">
              Sản phẩm sắp hết hàng
            </h2>
            <Link to="/admin/inventory">
              <Button variant="ghost" size="sm" className="h-8 text-[13px]">
                Xem kho
              </Button>
            </Link>
          </div>
          <AdminWorkspaceBody>
            {lowStockProducts.length === 0 ? (
              <p className="px-5 py-12 text-center text-[13px] text-muted-foreground lg:px-6">
                Không có SPU nào dưới ngưỡng tồn kho
              </p>
            ) : (
              <div className={cn("divide-y", adminDividerClass)}>
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 px-5 py-3 lg:px-6"
                  >
                    {product.imgUrl ? (
                      <img
                        src={product.imgUrl}
                        alt={product.name}
                        className="size-9 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="size-9 shrink-0 rounded-lg bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">
                        {product.name}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {product.categoryName}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-[13px] font-medium text-red-600 dark:text-red-400">
                        {product.totalStock}
                      </p>
                      <p className="font-mono text-[12px] text-muted-foreground">
                        {product.skus.length} SKU
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminWorkspaceBody>
        </AdminWorkspace>
      </div>
    </div>
  )
}
