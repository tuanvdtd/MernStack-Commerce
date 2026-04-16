import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAdminStore } from "~/stores/adminStore";
import { mockOrders } from "~/mock/adminData";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Search, Eye, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const ITEMS_PER_PAGE = 10;

export function OrdersList() {
  const { orders, setOrders } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (orders.length === 0) {
      setOrders(mockOrders);
    }
  }, [orders, setOrders]);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || order.paymentMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  const getPaymentMethodText = (method: string) => {
    const methods: Record<string, string> = {
      cod: "COD",
      card: "Thẻ",
      ewallet: "Ví điện tử"
    };
    return methods[method] || method;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "text-yellow-600",
      paid: "text-green-600",
      failed: "text-red-600",
      refunded: "text-gray-600"
    };
    return colors[status] || "text-gray-600";
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing" || o.status === "confirmed").length,
    completed: orders.filter(o => o.status === "delivered").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-gray-600 mt-1">Tất cả {filteredOrders.length} đơn hàng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Tổng đơn hàng</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Chờ xử lý</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Đang xử lý</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">{stats.processing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Đã hoàn thành</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm mã đơn, khách hàng..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="shipped">Đã giao vận</SelectItem>
                <SelectItem value="delivered">Đã giao</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={(value) => {
              setPaymentFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="cod">COD</SelectItem>
                <SelectItem value="card">Thẻ</SelectItem>
                <SelectItem value="ewallet">Ví điện tử</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      Không tìm thấy đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{order.orderNumber}</p>
                          {order.trackingNumber && (
                            <p className="text-xs text-gray-500">MVĐ: {order.trackingNumber}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(order.createdAt), "dd/MM/yyyy", { locale: vi })}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(order.createdAt), "HH:mm")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.productImage}
                              alt={item.productName}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover"
                            />
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-medium">+{order.items.length - 3}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{order.items.length} sản phẩm</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-[#0ACDFF]">
                          {order.total.toLocaleString()}đ
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{getPaymentMethodText(order.paymentMethod)}</p>
                          <p className={`text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus === "paid" ? "Đã thanh toán" : 
                             order.paymentStatus === "pending" ? "Chưa thanh toán" :
                             order.paymentStatus === "failed" ? "Thất bại" : "Đã hoàn tiền"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)} trong tổng số {filteredOrders.length} đơn hàng
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? "bg-[#0ACDFF] hover:bg-[#0ACDFF]/90" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
