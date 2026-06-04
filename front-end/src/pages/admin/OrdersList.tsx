import { useEffect, useState } from "react"
import { Link } from "react-router"
import { useAdminStore } from "~/stores/adminStore"
import { mockOrders } from "~/mock/adminData"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Search, Eye, ShoppingCart } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { AdminPage } from "~/components/admin/AdminPage"
import { AdminPageHeader } from "~/components/admin/AdminPageHeader"
import { AdminStatCard, AdminStatGrid } from "~/components/admin/AdminStatCard"
import {
  AdminToolbar,
  AdminToolbarField,
  AdminToolbarSearch,
} from "~/components/admin/AdminToolbar"
import { AdminTableShell } from "~/components/admin/AdminTableShell"
import { AdminPagination } from "~/components/admin/AdminPagination"
import { AdminEmptyState } from "~/components/admin/AdminEmptyState"
import { OrderStatusBadge } from "~/components/admin/OrderStatusBadge"
import { adminBrandTextClass, formatVnd } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"

const ITEMS_PER_PAGE = 10

export function OrdersList() {
  const { orders, setOrders } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (orders.length === 0) setOrders(mockOrders)
  }, [orders, setOrders])

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q)
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter
    const matchesPayment =
      paymentFilter === "all" || order.paymentMethod === paymentFilter
    return matchesSearch && matchesStatus && matchesPayment
  })

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter(
      (o) => o.status === "processing" || o.status === "confirmed"
    ).length,
    completed: orders.filter((o) => o.status === "delivered").length,
  }

  const getPaymentMethodText = (method: string) => {
    const methods: Record<string, string> = {
      cod: "COD",
      card: "Thẻ",
      ewallet: "Ví điện tử",
    }
    return methods[method] ?? method
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Đơn hàng"
        description={`${filteredOrders.length} đơn sau bộ lọc`}
      />

      <AdminStatGrid columns={4}>
        <AdminStatCard label="Tổng đơn" value={stats.total} />
        <AdminStatCard
          label="Chờ xử lý"
          value={stats.pending}
          tone="warning"
        />
        <AdminStatCard
          label="Đang xử lý"
          value={stats.processing}
          tone="brand"
        />
        <AdminStatCard
          label="Hoàn thành"
          value={stats.completed}
          tone="success"
        />
      </AdminStatGrid>

      <AdminToolbar>
        <AdminToolbarSearch>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder="Mã đơn, tên hoặc email khách..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>
        </AdminToolbarSearch>
        <AdminToolbarField>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="processing">Đang xử lý</SelectItem>
              <SelectItem value="shipped">Đã giao vận</SelectItem>
              <SelectItem value="delivered">Đã giao</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
              <SelectItem value="refunded">Hoàn tiền</SelectItem>
            </SelectContent>
          </Select>
        </AdminToolbarField>
        <AdminToolbarField>
          <Select
            value={paymentFilter}
            onValueChange={(v) => {
              setPaymentFilter(v)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi hình thức</SelectItem>
              <SelectItem value="cod">COD</SelectItem>
              <SelectItem value="card">Thẻ</SelectItem>
              <SelectItem value="ewallet">Ví điện tử</SelectItem>
            </SelectContent>
          </Select>
        </AdminToolbarField>
      </AdminToolbar>

      <AdminTableShell>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">Mã đơn</TableHead>
              <TableHead className="px-4">Khách hàng</TableHead>
              <TableHead className="px-4">Ngày đặt</TableHead>
              <TableHead className="px-4">Sản phẩm</TableHead>
              <TableHead className="px-4">Tổng</TableHead>
              <TableHead className="px-4">Thanh toán</TableHead>
              <TableHead className="px-4">Trạng thái</TableHead>
              <TableHead className="px-4 text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="p-0">
                  <AdminEmptyState
                    icon={ShoppingCart}
                    title="Không có đơn hàng"
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-4">
                    <p className="font-medium">{order.orderNumber}</p>
                    {order.trackingNumber && (
                      <p className="text-xs text-muted-foreground">
                        MVĐ: {order.trackingNumber}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="px-4">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customerEmail}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 text-sm">
                    <p>
                      {format(new Date(order.createdAt), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "HH:mm")}
                    </p>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.productImage}
                          alt=""
                          className="size-8 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.items.length} SP
                    </p>
                  </TableCell>
                  <TableCell className="px-4">
                    <p
                      className={cn(
                        "font-semibold tabular-nums",
                        adminBrandTextClass
                      )}
                    >
                      {formatVnd(order.total)}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 text-sm">
                    <p>{getPaymentMethodText(order.paymentMethod)}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.paymentStatus === "paid"
                        ? "Đã thanh toán"
                        : order.paymentStatus === "pending"
                          ? "Chưa TT"
                          : order.paymentStatus}
                    </p>
                  </TableCell>
                  <TableCell className="px-4">
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <Link to={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="icon-sm" aria-label="Xem">
                        <Eye className="size-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredOrders.length}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        itemLabel="đơn hàng"
      />
    </AdminPage>
  )
}
