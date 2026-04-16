import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAdminStore } from "~/stores/adminStore";
import { mockOrders } from "~/mock/adminData";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { type Order } from "~/types/admin/index";

export function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { orders, setOrders, updateOrderStatus } = useAdminStore();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orders.length === 0) {
      setOrders(mockOrders);
    }
  }, [orders, setOrders]);

  useEffect(() => {
    if (id) {
      const foundOrder = orders.find(o => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
  }, [id, orders]);

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Đơn hàng không tồn tại</p>
        <Button onClick={() => navigate("/admin/orders")} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: Order['status']) => {
    updateOrderStatus(order.id, newStatus);
    setOrder({ ...order, status: newStatus });
    toast.success("Đã cập nhật trạng thái đơn hàng");
  };

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

  const statusOptions: Order['status'][] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded"
  ];

  // Timeline
  const timeline = [
    { status: "pending", label: "Đơn hàng đã đặt", completed: true },
    { status: "confirmed", label: "Đã xác nhận", completed: ["confirmed", "processing", "shipped", "delivered"].includes(order.status) },
    { status: "processing", label: "Đang xử lý", completed: ["processing", "shipped", "delivered"].includes(order.status) },
    { status: "shipped", label: "Đã giao vận", completed: ["shipped", "delivered"].includes(order.status) },
    { status: "delivered", label: "Đã giao hàng", completed: order.status === "delivered" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">
              Đặt lúc {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
            </p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      {/* Timeline */}
      {!["cancelled", "refunded"].includes(order.status) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {timeline.map((item, index) => (
                <div key={item.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.completed ? "bg-[#0ACDFF] text-white" : "bg-gray-200 text-gray-400"
                    }`}>
                      {item.completed ? "✓" : index + 1}
                    </div>
                    <p className={`text-xs mt-2 text-center ${
                      item.completed ? "text-gray-900 font-medium" : "text-gray-500"
                    }`}>
                      {item.label}
                    </p>
                  </div>
                  {index < timeline.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      item.completed ? "bg-[#0ACDFF]" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Sản phẩm ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <div className="mt-1 space-y-1">
                        {item.variants.map((variant, idx) => (
                          <p key={idx} className="text-xs text-gray-600">
                            {variant.name}: {variant.value}
                          </p>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#0ACDFF]">
                        {item.price.toLocaleString()}đ
                      </p>
                      <p className="text-sm text-gray-600 mt-1">x{item.quantity}</p>
                      <p className="font-semibold mt-2">
                        {item.total.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span>{order.subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span>{order.shippingFee.toLocaleString()}đ</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Giảm giá</span>
                    <span>-{order.discount.toLocaleString()}đ</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-[#0ACDFF]">{order.total.toLocaleString()}đ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Cập nhật trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={order.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusText(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Họ tên</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.customerEmail}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-medium">{order.shippingAddress.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                <p className="font-medium">{order.shippingAddress.address}</p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.ward}, {order.shippingAddress.district}
                </p>
                <p className="text-sm text-gray-600">{order.shippingAddress.city}</p>
              </div>
              {order.note && (
                <div>
                  <p className="text-sm text-gray-600">Ghi chú</p>
                  <p className="text-sm italic">{order.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Phương thức</p>
                <p className="font-medium">
                  {order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" :
                   order.paymentMethod === "card" ? "Thẻ tín dụng/ghi nợ" :
                   "Ví điện tử"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                  {order.paymentStatus === "paid" ? "Đã thanh toán" :
                   order.paymentStatus === "pending" ? "Chưa thanh toán" :
                   order.paymentStatus === "failed" ? "Thất bại" : "Đã hoàn tiền"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Vận chuyển
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-gray-600">Mã vận đơn</p>
                  <p className="font-mono font-medium">{order.trackingNumber}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
