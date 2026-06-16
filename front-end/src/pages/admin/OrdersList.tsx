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
import { enUS } from "date-fns/locale"
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
  card: "Card",
  ewallet: "E-wallet",
}

const paymentStatusLabels: Record<string, string> = {
  paid: "Paid",
  pending: "Unpaid",
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
        title="Orders"
        description="Track status and payment for each order."
      />

      <AdminMetricStrip
        metrics={[
          { label: "Total orders", value: orders.length },
          {
            label: "Pending",
            value: orders.filter((o) => o.status === "pending").length,
            tone: "warning",
          },
          {
            label: "In progress",
            value: orders.filter(
              (o) => o.status === "processing" || o.status === "confirmed"
            ).length,
            tone: "brand",
          },
          {
            label: "Completed",
            value: orders.filter((o) => o.status === "delivered").length,
            tone: "success",
          },
        ]}
      />

      <AdminFilterRow>
        <AdminFilterSearch label="Keyword">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-brand)]"
              strokeWidth={2}
            />
            <Input
              placeholder="Order code, name, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className={cn("pl-9", adminFilterInputClass)}
            />
          </div>
        </AdminFilterSearch>
        <AdminFilterField label="Order status">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className={cn("w-full", adminFilterInputClass)}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </AdminFilterField>
        <AdminFilterField label="Payment">
          <Select
            value={paymentFilter}
            onValueChange={(v) => {
              setPaymentFilter(v)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className={cn("w-full", adminFilterInputClass)}>
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="cod">COD</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="ewallet">E-wallet</SelectItem>
            </SelectContent>
          </Select>
        </AdminFilterField>
      </AdminFilterRow>

      <AdminWorkspaceBody>
        <Table>
          <TableHeader>
            <TableRow className={cn("hover:bg-transparent", adminDividerClass)}>
              <TableHead className={adminThClass}>Order code</TableHead>
              <TableHead className={adminThClass}>Customer</TableHead>
              <TableHead className={adminThClass}>Order date</TableHead>
              <TableHead className={adminThClass}>Products</TableHead>
              <TableHead className={adminThClass}>Total</TableHead>
              <TableHead className={adminThClass}>Payment</TableHead>
              <TableHead className={adminThClass}>Status</TableHead>
              <TableHead className={cn(adminThClass, "text-right")}>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="p-0">
                  <AdminEmptyState
                    icon={ShoppingCart}
                    title="No orders"
                    description={
                      hasActiveFilters
                        ? "Try changing filters or keywords."
                        : "There are no orders in the system yet."
                    }
                    action={
                      hasActiveFilters ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[13px]"
                          onClick={handleClearFilters}
                        >
                          Clear filters
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
                        Tracking: {order.trackingNumber}
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
                        locale: enUS,
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
                          aria-label="View details"
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
          itemLabel="orders"
        />
      </AdminWorkspaceFooter>
    </AdminWorkspace>
  )
}
