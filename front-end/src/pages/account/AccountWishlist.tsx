import { Heart, ShoppingBag, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { formatPrice } from "~/lib/account/formatters"

const wishlist = [
  {
    id: "13",
    name: "ASUS ROG Zephyrus G14 - Gaming Laptop",
    image:
      "https://images.unsplash.com/photo-1606625000171-fa7d471da28c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    price: 42990000,
    originalPrice: 52990000,
    discount: 19,
    rating: 4.8,
  },
  {
    id: "14",
    name: "Samsung Galaxy Buds2 Pro",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    price: 4490000,
    originalPrice: 5490000,
    discount: 18,
    rating: 4.5,
  },
]

/** Tab sản phẩm yêu thích. */
export function AccountWishlist() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="px-6">
          <CardTitle className="text-xl font-semibold">Sản phẩm yêu thích</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pt-0 pb-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {wishlist.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden group hover:shadow-lg transition-all"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 shadow-md">
                    -{item.discount}%
                  </Badge>
                  <button
                    type="button"
                    aria-label="Bỏ yêu thích"
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-md transition-all cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </button>
                </div>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm leading-snug">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(item.rating)
                            ? "fill-current"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                    <span className="text-slate-400 ml-1">{item.rating}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-red-500">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cursor-pointer">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Thêm vào giỏ
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
