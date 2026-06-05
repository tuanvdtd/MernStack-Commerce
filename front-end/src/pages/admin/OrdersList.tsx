import { useEffect, useMemo, useState } from "react"
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
import { Search, ArrowUpRight, ShoppingCart } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  AdminWorkspace,
  AdminWorkspaceHeader,
  AdminMetricStrip,
  AdminFilterRow,
  AdminFilterSearch,
  AdminFilterField,
  AdminWorkspaceBody,
  AdminWorkspaceFooter,
} from "~/components/admin/AdminWorkspace"
import { AdminTableSkeleton } from "~/components/admin/AdminTableSkeleton"
import { AdminPagination } from "~/components/admin/AdminPagination"
import { AdminEmptyState } from "~/components/admin/AdminEmptyState"
import { OrderStatusBadge } from "~/components/admin/OrderStatusBadge"
import {
  adminBrandTextClass,
  adminGhostButtonClass,
  adminMonoClass,
  adminThClass,
  adminTdClass,
  adminDividerClass,
  adminFilterInputClass,
  adminRowActionClass,
  formatVnd,
} from "~/lib/admin/ui"
import { ADMIN_PAGE_SIZE, paginate } from "~/lib/admin/pagination"
import { cn } from "~/lib/utils"

const paymentLabels: Record<string, string> = {
  cod: "COD",
  card: "Thẻ",
  ewallet: "Ví điện tử",
}

const paymentStatusLabels: Record<string, string> = {
  paid: "Đã thanh toán",
  pending: "Chưa thanh toán",
}

export function OrdersList() {
  const { orders, setOrders } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (orders.length === 0) setOrders(mockOrders)
    const timer = window.setTimeout(() => setIsLoading(false), 280)
    return () => window.clearTimeout(timer)
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

  const { items: paginatedOrders, totalPages } = useMemo(
    () => paginate(filteredOrders, currentPage, ADMIN_PAGE_SIZE),
    [filteredOrders, currentPage]
  )

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const hasActiveFilters =
    searchQuery !== "" || statusFilter !== "all" || paymentFilter !== "all"

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setPaymentFilter("all")
    setCurrentPage(1)
  }

  if (isLoading) return <AdminTableSkeleton />

  return (
    <AdminWorkspace>
      <AdminWorkspaceHeader
        title="Đơn hàng"
        description="Theo dõi trạng thái và thanh toán từng đơn."
      />

      <AdminMetricStrip
        metrics={[
          { label: "Tổng đơn", value: orders.length },
          {
            label: "Chờ xử lý",
            value: orders.filter((o) => o.status === "pending").length,
            tone: "warning",
          },
          {
            label: "Đang xử lý",
            value: orders.filter(
              (o) => o.status === "processing" || o.status === "confirmed"
            ).length,
            tone: "brand",
          },
          {
            label: "Hoàn thành",
            value: orders.filter((o) => o.status === "delivered").length,
            tone: "success",
          },
        ]}
      />

      <AdminFilterRow>
        <AdminFilterSearch label="Từ khóa">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-brand)]"
              strokeWidth={2}
            />
            <Input
              placeholder="Mã đơn, tên, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className={cn("pl-9", adminFilterInputClass)}
            />
          </div>
        </AdminFilterSearch>
        <AdminFilterField label="Trạng thái đơn">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className={cn("w-full", adminFilterInputClass)}>
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
        </AdminFilterField>
        <AdminFilterField label="Thanh toán">
          <Select
            value={paymentFilter}
            onValueChange={(v) => {
              setPaymentFilter(v)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className={cn("w-full", adminFilterInputClass)}>
              <SelectValue placeholder="Thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi hình thức</SelectItem>
              <SelectItem value="cod">COD</SelectItem>
              <SelectItem value="card">Thẻ</SelectItem>
              <SelectItem value="ewallet">Ví điện tử</SelectItem>
            </SelectContent>
          </Select>
        </AdminFilterField>
      </AdminFilterRow>

      <AdminWorkspaceBody>
        <Table>
          <TableHeader>
            <TableRow className={cn("hover:bg-transparent", adminDividerClass)}>
              <TableHead className={adminThClass}>Mã đơn</TableHead>
              <TableHead className={adminThClass}>Khách hàng</TableHead>
              <TableHead className={adminThClass}>Ngày đặt</TableHead>
              <TableHead className={adminThClass}>Sản phẩm</TableHead>
              <TableHead className={adminThClass}>Tổng</TableHead>
              <TableHead className={adminThClass}>Thanh toán</TableHead>
              <TableHead className={adminThClass}>Trạng thái</TableHead>
              <TableHead className={cn(adminThClass, "text-right")}>Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="p-0">
                  <AdminEmptyState
                    icon={ShoppingCart}
                    title="Không có đơn hàng"
                    description={
                      hasActiveFilters
                        ? "Thử đổi bộ lọc hoặc từ khóa."
                        : "Chưa có đơn trong hệ thống."
                    }
                    action={
                      hasActiveFilters ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[13px]"
                          onClick={handleClearFilters}
                        >
                          Xóa bộ lọc
                        </Button>
                      ) : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className={cn("group", adminDividerClass)}
                >
                  <TableCell className={adminTdClass}>
                    <p className="font-medium">{order.orderNumber}</p>
                    {order.trackingNumber && (
                      <p className={cn(adminMonoClass, "text-[12px]")}>
                        MVĐ: {order.trackingNumber}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {order.customerEmail}
                    </p>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <p>
                      {format(new Date(order.createdAt), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </p>
                    <p className={cn(adminMonoClass, "text-[12px]")}>
                      {format(new Date(order.createdAt), "HH:mm")}
                    </p>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <img
                            key={idx}
                            src={item.productImage}
                            alt=""
                            className="size-7 rounded-full border-2 border-background object-cover"
                          />
                        ))}
                      </div>
                      <span className={cn(adminMonoClass, "text-[12px]")}>
                        {order.items.length}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <span className={cn("font-mono font-medium", adminBrandTextClass)}>
                      {formatVnd(order.total)}
                    </span>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <p>{paymentLabels[order.paymentMethod] ?? order.paymentMethod}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
                    </p>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className={cn(adminTdClass, "text-right")}>
                    <div className={adminRowActionClass}>
                      <Link to={`/admin/orders/${order.id}`}>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className={cn("size-8 bg-background", adminGhostButtonClass)}
                          aria-label="Xem chi tiết"
                        >
                          <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminWorkspaceBody>

      <AdminWorkspaceFooter>
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          pageSize={ADMIN_PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="đơn hàng"
        />
      </AdminWorkspaceFooter>
    </AdminWorkspace>
  )
}
