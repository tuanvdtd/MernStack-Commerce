import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
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
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { toast } from "sonner"
import { AdminPage } from "~/components/admin/AdminPage"
import { AdminPageHeader } from "~/components/admin/AdminPageHeader"
import { adminBrandTextClass, formatVnd } from "~/lib/admin/ui"
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS, PAYMENT_STATUS_LABELS } from "~/lib/admin/realOrderStatus"
import { cn } from "~/lib/utils"
import { fetchAdminOrder, updateAdminOrderStatus, type Order } from "~/apis/orderApi"

export function OrderDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = () => {
    if (!id) return
    fetchAdminOrder(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false))
  }

  useEffect(load, [id])

  if (isLoading) return null

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

  const handleStatusChange = async (newStatus: Order["orderStatus"]) => {
    try {
      const updated = await updateAdminOrderStatus(order.id, { orderStatus: newStatus })
      setOrder(updated)
      toast.success("Status updated")
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message ?? "Failed to update status")
    }
  }

  const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[order.orderStatus]
  const timeline = [
    { status: "PENDING", label: "Placed", completed: true },
    {
      status: "CONFIRMED",
      label: "Confirmed",
      completed: ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.orderStatus),
    },
    {
      status: "SHIPPED",
      label: "Shipping",
      completed: ["SHIPPED", "DELIVERED"].includes(order.orderStatus),
    },
    { status: "DELIVERED", label: "Completed", completed: order.orderStatus === "DELIVERED" },
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
        actions={
          <span className="inline-flex rounded-md bg-muted px-3 py-1 text-sm font-medium">
            {ORDER_STATUS_LABELS[order.orderStatus]}
          </span>
        }
      />

      {order.orderStatus !== "CANCELLED" && (
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
                        item.completed ? "font-medium text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </p>
                  </div>
                  {index < timeline.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 h-0.5 flex-1 sm:mx-2",
                        item.completed ? "bg-[var(--admin-brand)]" : "bg-border"
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
                <div key={item.id} className="flex gap-4 rounded-lg border border-border/80 p-4">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="size-20 shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("font-semibold tabular-nums", adminBrandTextClass)}>
                      {formatVnd(item.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                    <p className="mt-2 font-semibold tabular-nums">{formatVnd(item.total)}</p>
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
                  <span className="tabular-nums">{formatVnd(order.shippingFee)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Discount</span>
                    <span className="tabular-nums">-{formatVnd(order.discountAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className={cn("tabular-nums", adminBrandTextClass)}>{formatVnd(order.total)}</span>
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
              <Select
                value={order.orderStatus}
                onValueChange={(v) => handleStatusChange(v as Order["orderStatus"])}
                disabled={allowedNextStatuses.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={order.orderStatus}>
                    {ORDER_STATUS_LABELS[order.orderStatus]} (current)
                  </SelectItem>
                  {allowedNextStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
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
                <p className="text-muted-foreground">Recipient</p>
                <p className="font-medium">{order.recipientName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{order.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{order.addressDetail}</p>
                <p className="text-muted-foreground">{order.wardName}</p>
                <p className="text-muted-foreground">{order.provinceName}</p>
              </div>
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
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={order.paymentStatus === "PAID" ? "default" : "secondary"}>
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPage>
  )
}
