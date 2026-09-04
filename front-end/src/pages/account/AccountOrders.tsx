import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Truck, CheckCircle2, Clock, XCircle, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs"
import { formatPrice } from "~/lib/account/formatters"
import { fetchMyOrders, type Order } from "~/apis/orderApi"

const STATUS_CONFIG: Record<
  Order["orderStatus"],
  { icon: typeof Truck; color: string; bg: string; label: string }
> = {
  PENDING: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Pending" },
  CONFIRMED: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Confirmed" },
  SHIPPED: { icon: Truck, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "Shipping" },
  DELIVERED: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    label: "Delivered",
  },
  CANCELLED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "Cancelled" },
}

const TABS = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "SHIPPED", label: "Shipping" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
] as const

/** My orders tab. */
export function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMyOrders({ limit: 50 })
      .then((res) => setOrders(res.items))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return null

  const renderList = (items: Order[]) => (
    <div className="space-y-4 mt-4">
      {items.length === 0 && <p className="text-center text-slate-400 py-12">No orders here yet.</p>}
      {items.map((order) => {
        const config = STATUS_CONFIG[order.orderStatus]
        const StatusIcon = config.icon
        return (
          <Card key={order.id} className="hover:shadow-md transition-shadow group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-mono text-slate-600">{order.orderNumber}</span>
                </div>
                <Badge variant="outline" className={`${config.bg} ${config.color} border font-medium`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                {order.items[0]?.imageUrl && (
                  <img
                    src={order.items[0].imageUrl}
                    alt="Product in order"
                    className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-100"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-500">
                    {order.items.length} items - {new Date(order.createdAt).toLocaleDateString("en-US")}
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{formatPrice(order.total)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                    <Link to="/track-order">Track</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">My orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="w-full">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="cursor-pointer">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {renderList(
                  tab.value === "all" ? orders : orders.filter((o) => o.orderStatus === tab.value)
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
