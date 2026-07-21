import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useAdminStore } from "~/stores/adminStore"
import { mockOrders } from "~/mock/adminData"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Badge } from "~/components/ui/badge"
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from "lucide-react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { toast } from "sonner"
import type { Order } from "~/types/admin/index"
import { AdminPage } from "~/components/admin/AdminPage"
import { AdminPageHeader } from "~/components/admin/AdminPageHeader"
import { OrderStatusBadge } from "~/components/admin/OrderStatusBadge"
import {
  adminBrandTextClass,
  formatVnd,
  getOrderStatusLabel,
} from "~/lib/admin/ui"
import { cn } from "~/lib/utils"

export function OrderDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { orders, setOrders, updateOrderStatus } = useAdminStore()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (orders.length === 0) setOrders(mockOrders)
  }, [orders, setOrders])

  useEffect(() => {
    if (!id) return
    const found = orders.find((o) => o.id === id)
    if (found) setOrder(found)
  }, [id, orders])

  if (!order) {
    return (
      <AdminPage>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-sm text-muted-foreground">Order does not exist</p>
          <Button variant="outline" onClick={() => navigate("/admin/orders")}>
            Back to list
          </Button>
        </div>
      </AdminPage>
    )
  }

  const handleStatusChange = (newStatus: Order["status"]) => {
    updateOrderStatus(order.id, newStatus)
    setOrder({ ...order, status: newStatus })
    toast.success("Status updated")
  }

  const statusOptions: Order["status"][] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]

  const timeline = [
    { status: "pending", label: "Placed", completed: true },
    {
      status: "confirmed",
      label: "Confirmed",
      completed: ["confirmed", "processing", "shipped", "delivered"].includes(
        order.status
      ),
    },
    {
      status: "processing",
      label: "Processing",
      completed: ["processing", "shipped", "delivered"].includes(order.status),
    },
    {
      status: "shipped",
      label: "Shipping",
      completed: ["shipped", "delivered"].includes(order.status),
    },
    {
      status: "delivered",
      label: "Completed",
      completed: order.status === "delivered",
    },
  ]

  return (
    <AdminPage>
      <AdminPageHeader
        title={order.orderNumber}
        description={`Ordered at ${format(new Date(order.createdAt), "MM/dd/yyyy HH:mm", { locale: enUS })}`}
        leading={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => navigate("/admin/orders")}
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </Button>
        }
        actions={<OrderStatusBadge status={order.status} className="px-3 py-1" />}
      />

      {!["cancelled", "refunded"].includes(order.status) && (
        <Card className="shadow-none">
          <CardContent className="py-6">
            <div className="flex items-center justify-between gap-2">
              {timeline.map((item, index) => (
                <div key={item.status} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full text-xs font-semibold",
                        item.completed
                          ? "bg-[var(--admin-brand)] text-[var(--admin-brand-foreground)]"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {item.completed ? "OK" : index + 1}
                    </div>
                    <p
                      className={cn(
                        "max-w-[4.5rem] text-center text-[0.65rem] leading-tight sm:max-w-none sm:text-xs",
                        item.completed
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </p>
                  </div>
                  {index < timeline.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 h-0.5 flex-1 sm:mx-2",
                        item.completed
                          ? "bg-[var(--admin-brand)]"
                          : "bg-border"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-none">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" aria-hidden />
                Products ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-lg border border-border/80 p-4"
                >
                  <img
                    src={item.productImage}
                    alt=""
                    className="size-20 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <div className="mt-1 space-y-0.5">
                      {item.variants.map((variant, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground">
                          {variant.optionName}: {variant.value}
                        </p>
                      ))}
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {item.skuId}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "font-semibold tabular-nums",
                        adminBrandTextClass
                      )}
                    >
                      {formatVnd(item.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      x{item.quantity}
                    </p>
                    <p className="mt-2 font-semibold tabular-nums">
                      {formatVnd(item.total)}
                    </p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatVnd(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping fee</span>
                  <span className="tabular-nums">
                    {formatVnd(order.shippingFee)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Discount</span>
                    <span className="tabular-nums">
                      -{formatVnd(order.discount)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span
                    className={cn("tabular-nums", adminBrandTextClass)}
                  >
                    {formatVnd(order.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Update status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Select value={order.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getOrderStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="size-4 text-muted-foreground" aria-hidden />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-sm">
              <div>
                <p className="text-muted-foreground">Full name</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{order.customerEmail}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{order.shippingAddress.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{order.shippingAddress.address}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.ward},{" "}
                  {order.shippingAddress.district}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}
                </p>
              </div>
              {order.note && (
                <div>
                  <p className="text-muted-foreground">Note</p>
                  <p className="italic">{order.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="size-4 text-muted-foreground" aria-hidden />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6 text-sm">
              <div>
                <p className="text-muted-foreground">Method</p>
                <p className="font-medium">
                  {order.paymentMethod === "cod"
                    ? "COD"
                    : order.paymentMethod === "card"
                      ? "Card"
                      : "E-wallet"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge
                  variant={
                    order.paymentStatus === "paid" ? "default" : "secondary"
                  }
                >
                  {order.paymentStatus === "paid"
                    ? "Paid"
                    : order.paymentStatus === "pending"
                      ? "Unpaid"
                      : order.paymentStatus === "failed"
                        ? "Failed"
                        : "Refunded"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {order.trackingNumber && (
            <Card className="shadow-none">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="size-4 text-muted-foreground" aria-hidden />
                  Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Tracking number</p>
                <p className="font-mono font-medium">{order.trackingNumber}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminPage>
  )
}
