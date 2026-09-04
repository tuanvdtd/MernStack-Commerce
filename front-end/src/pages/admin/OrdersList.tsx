import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
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
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "~/lib/admin/realOrderStatus"
import { ADMIN_PAGE_SIZE, paginate } from "~/lib/admin/pagination"
import { cn } from "~/lib/utils"
import { fetchAdminOrders, type Order } from "~/apis/orderApi"

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAdminOrders({ limit: 200 })
      .then((res) => setOrders(res.items))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(q) || order.recipientName.toLowerCase().includes(q)
    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const { items: paginatedOrders, totalPages } = useMemo(
    () => paginate(filteredOrders, currentPage, ADMIN_PAGE_SIZE),
    [filteredOrders, currentPage]
  )

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(Math.max(1, totalPages))
  }, [currentPage, totalPages])

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all"

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
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
            value: orders.filter((o) => o.orderStatus === "PENDING").length,
            tone: "warning",
          },
          {
            label: "In progress",
            value: orders.filter((o) => ["CONFIRMED", "SHIPPED"].includes(o.orderStatus)).length,
            tone: "brand",
          },
          {
            label: "Completed",
            value: orders.filter((o) => o.orderStatus === "DELIVERED").length,
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
              placeholder="Order code, recipient name..."
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
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminFilterField>
      </AdminFilterRow>

      <AdminWorkspaceBody>
        <Table>
          <TableHeader>
            <TableRow className={cn("hover:bg-transparent", adminDividerClass)}>
              <TableHead className={adminThClass}>Order code</TableHead>
              <TableHead className={adminThClass}>Recipient</TableHead>
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
                        <Button variant="outline" size="sm" className="h-8 text-[13px]" onClick={handleClearFilters}>
                          Clear filters
                        </Button>
                      ) : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id} className={cn("group", adminDividerClass)}>
                  <TableCell className={adminTdClass}>
                    <p className="font-medium">{order.orderNumber}</p>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <p className="font-medium">{order.recipientName}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{order.phone}</p>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <p>{format(new Date(order.createdAt), "dd/MM/yyyy", { locale: enUS })}</p>
                    <p className={cn(adminMonoClass, "text-[12px]")}>
                      {format(new Date(order.createdAt), "HH:mm")}
                    </p>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <span className={cn(adminMonoClass, "text-[12px]")}>{order.items.length}</span>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <span className={cn("font-mono font-medium", adminBrandTextClass)}>
                      {formatVnd(order.total)}
                    </span>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <p>{order.paymentMethod}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </p>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium",
                        "bg-muted"
                      )}
                    >
                      {ORDER_STATUS_LABELS[order.orderStatus]}
                    </span>
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
