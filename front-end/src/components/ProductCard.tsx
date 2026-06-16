import { Link } from "react-router"
import { Star } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { storeTokens } from "~/lib/categoryTheme"

type ProductCardProps = {
  id: string
  image: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  sold?: number
  rating?: number
  reviews?: number
  variant?: "default" | "flashsale"
}

const formatPrice = (price: number) =>
  `${price.toLocaleString("en-US")} VND`

export const ProductCard = ({
  id,
  image,
  name,
  price,
  originalPrice,
  discount,
  sold,
  rating,
  reviews,
  variant = "default",
}: ProductCardProps) => {
  const isFlashSale = variant === "flashsale"

  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden border-gray-200 bg-white pt-0 pb-0 shadow-none",
        /* Keep hover subtle: shadow only, with no border, color, or scale shift. */
        "hover:shadow-[0_1px_8px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className={cn("relative aspect-square w-full shrink-0 overflow-hidden bg-[#f5f5f5]", isFlashSale && "p-2")}>
        <Link to={`/product/${id}`} className="block size-full">
          <img
            src={image}
            alt={name}
            className={cn("size-full object-cover", isFlashSale && "rounded")}
            loading="lazy"
          />
        </Link>
        {discount != null && (
          <Badge className="absolute top-1.5 left-1.5 z-10 rounded-sm bg-[#ee4d2d] px-1.5 text-[10px] text-white hover:bg-[#ee4d2d]">
            -{discount}%
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
        <Link to={`/product/${id}`}>
          <h3 className="line-clamp-2 min-h-[36px] text-xs font-normal leading-snug text-[#2b2f32] sm:text-sm">
            {name}
          </h3>
        </Link>

        {rating != null && reviews != null && (
          <div className="flex items-center gap-0.5">
            <Star className="size-3 fill-[#ffc107] text-[#ffc107]" aria-hidden="true" />
            <span className="text-[10px] text-[#757575] sm:text-xs">
              {rating} | {reviews.toLocaleString("en-US")} reviews
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className={cn("text-sm font-medium sm:text-base", storeTokens.price)}>{formatPrice(price)}</span>
          {originalPrice != null && (
            <span className="text-[10px] text-[#bdbdbd] line-through sm:text-xs">{formatPrice(originalPrice)}</span>
          )}
        </div>

        {sold != null && (
          <p className="text-[10px] text-[#757575]">Sold {sold}</p>
        )}

        <Button
          size="sm"
          variant="outline"
          className="mt-auto h-7 rounded-md border-gray-200 text-xs text-[#2b2f32] sm:h-8"
          asChild
        >
          <Link to={`/product/${id}`}>{isFlashSale ? "Buy now" : "View details"}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
