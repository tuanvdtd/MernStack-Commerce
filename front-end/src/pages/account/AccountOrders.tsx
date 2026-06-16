import { Link } from "react-router"
import {
  Truck,
  CheckCircle2,
  Clock,
  ShoppingBag,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs"
import { Progress } from "~/components/ui/progress"
import { formatPrice } from "~/lib/account/formatters"

const orders = [
  {
    id: "FLB2026040412345",
    date: "01/04/2026",
    status: "shipping",
    statusText: "Shipping",
    total: 44970000,
    items: 3,
    image:
      "https://images.unsplash.com/photo-1673718424704-51d0d2ca1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    progress: 65,
  },
  {
    id: "FLB2026032398765",
    date: "23/03/2026",
    status: "delivered",
    statusText: "Delivered",
    total: 15990000,
    items: 1,
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    progress: 100,
  },
  {
    id: "FLB2026031556789",
    date: "15/03/2026",
    status: "completed",
    statusText: "Completed",
    total: 8990000,
    items: 2,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    progress: 100,
  },
]

const statusConfig: Record<
  string,
  { icon: typeof Truck; color: string; bg: string }
> = {
  shipping: {
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  delivered: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  pending: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
}

/** My orders tab. */
export function AccountOrders() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">My orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="cursor-pointer">
                All
              </TabsTrigger>
              <TabsTrigger value="shipping" className="cursor-pointer">
                Shipping
              </TabsTrigger>
              <TabsTrigger value="delivered" className="cursor-pointer">
                Delivered
              </TabsTrigger>
              <TabsTrigger value="completed" className="cursor-pointer">
                Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {orders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.pending
                const StatusIcon = config.icon
                return (
                  <Card
                    key={order.id}
                    className="hover:shadow-md transition-shadow group"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-mono text-slate-600">
                            {order.id}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${config.bg} ${config.color} border font-medium`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {order.statusText}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4">
                        <img
                          src={order.image}
                          alt="Product in order"
                          className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-500">
                            {order.items} items - {order.date}
                          </p>
                          <p className="text-lg font-bold text-slate-900 mt-0.5">
                            {formatPrice(order.total)}
                          </p>
                          {order.status === "shipping" && (
                            <div className="mt-2">
                              <Progress value={order.progress} className="h-1.5" />
                              <p className="text-[11px] text-slate-400 mt-1">
                                Estimated delivery: Apr 3, 2026
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            asChild
                          >
                            <Link to="/track-order">Track</Link>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white cursor-pointer"
                          >
                            Buy again
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
            <TabsContent value="shipping">
              <p className="text-center text-slate-400 py-12">
                Filtering shipping orders...
              </p>
            </TabsContent>
            <TabsContent value="delivered">
              <p className="text-center text-slate-400 py-12">
                Filtering delivered orders...
              </p>
            </TabsContent>
            <TabsContent value="completed">
              <p className="text-center text-slate-400 py-12">
                Filtering completed orders...
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
