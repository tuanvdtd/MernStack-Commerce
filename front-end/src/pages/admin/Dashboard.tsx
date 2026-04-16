import { useEffect } from "react";
import { Link } from "react-router";
import { useAdminStore } from "~/stores/adminStore";
import { mockStats, mockProducts, mockOrders } from "~/mock/adminData";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  TrendingUp,
  Clock
} from "lucide-react";
import { Button } from "../../components/ui/button";

export function Dashboard() {
  const { stats, setStats, setProducts, setOrders, products, orders } = useAdminStore();

  useEffect(() => {
    // Initialize data
    if (products.length === 0) {
      setProducts(mockProducts);
    }
    if (orders.length === 0) {
      setOrders(mockOrders);
    }
    if (!stats) {
      setStats(mockStats);
    }
  }, [products, orders, stats, setProducts, setOrders, setStats]);

  if (!stats) return null;

  const statCards = [
    {
      title: "Tổng đơn hàng",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12.5%"
    },
    {
      title: "Doanh thu",
      value: `${(stats.totalRevenue / 1000000000).toFixed(2)}B`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8.2%"
    },
    {
      title: "Tổng sản phẩm",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Sản phẩm sắp hết hàng",
      value: stats.lowStockProducts.toLocaleString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Đơn hàng chờ xử lý",
      value: stats.pendingOrders.toLocaleString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Đơn hàng hôm nay",
      value: stats.todayOrders.toLocaleString(),
      icon: TrendingUp,
      color: "text-[#0ACDFF]",
      bgColor: "bg-[#0ACDFF]/10"
    }
  ];

  // Get recent orders
  const recentOrders = orders.slice(0, 5);

  // Get low stock products
  const lowStockProducts = products.filter(p => p.totalStock < 10);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const statusText: Record<string, string> = {
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      processing: "Đang xử lý",
      shipped: "Đã giao vận",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
      refunded: "Đã hoàn tiền"
    };
    return statusText[status] || status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan hệ thống FlashBuy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.change && (
                      <p className="text-xs text-green-600 mt-1">{stat.change} so với tháng trước</p>
                    )}
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm">Xem tất cả</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{order.orderNumber}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#0ACDFF]">
                      {order.total.toLocaleString()}đ
                    </p>
                    <p className="text-xs text-gray-500">{order.items.length} sản phẩm</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sản phẩm sắp hết hàng</CardTitle>
            <Link to="/admin/inventory">
              <Button variant="ghost" size="sm">Xem tất cả</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Không có sản phẩm nào sắp hết hàng</p>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <img 
                      src={product.images[0]?.url} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        {product.totalStock} còn lại
                      </p>
                      <p className="text-xs text-gray-500">{product.skus.length} SKU</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
