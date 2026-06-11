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
    statusText: "Đang giao hàng",
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
    statusText: "Đã giao hàng",
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
    statusText: "Hoàn thành",
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

/** Tab đơn hàng của tôi. */
export function AccountOrders() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Đơn hàng của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="cursor-pointer">
                Tất cả
              </TabsTrigger>
              <TabsTrigger value="shipping" className="cursor-pointer">
                Đang giao
              </TabsTrigger>
              <TabsTrigger value="delivered" className="cursor-pointer">
                Đã giao
              </TabsTrigger>
              <TabsTrigger value="completed" className="cursor-pointer">
                Hoàn thành
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
                          alt="Sản phẩm trong đơn"
                          className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-500">
                            {order.items} sản phẩm • {order.date}
                          </p>
                          <p className="text-lg font-bold text-slate-900 mt-0.5">
                            {formatPrice(order.total)}
                          </p>
                          {order.status === "shipping" && (
                            <div className="mt-2">
                              <Progress value={order.progress} className="h-1.5" />
                              <p className="text-[11px] text-slate-400 mt-1">
                                Dự kiến giao: 03/04/2026
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
                            <Link to="/track-order">Theo dõi</Link>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white cursor-pointer"
                          >
                            Mua lại
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
                Lọc đơn đang giao...
              </p>
            </TabsContent>
            <TabsContent value="delivered">
              <p className="text-center text-slate-400 py-12">
                Lọc đơn đã giao...
              </p>
            </TabsContent>
            <TabsContent value="completed">
              <p className="text-center text-slate-400 py-12">
                Lọc đơn hoàn thành...
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
