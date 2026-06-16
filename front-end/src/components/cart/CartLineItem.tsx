import { Link } from "react-router"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Checkbox } from "~/components/ui/checkbox"
import { Button } from "~/components/ui/button"
import { storeTokens } from "~/lib/categoryTheme"
import { cn } from "~/lib/utils"

export type CartItemData = {
  id: string
  productId: string
  name: string
  variant: string
  image: string
  price: number
  quantity: number
  selected: boolean
}

type CartLineItemProps = {
  item: CartItemData
  onToggleSelect: (id: string) => void
  onUpdateQuantity: (id: string, delta: number) => void
  onRemove: (id: string) => void
  formatPrice: (price: number) => string
}

export function CartLineItem({
  item,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
  formatPrice,
}: CartLineItemProps) {
  const lineTotal = item.price * item.quantity

  return (
    <article
      className={cn(
        "flex flex-col gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-5",
        !item.selected && "opacity-70"
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <Checkbox
          checked={item.selected}
          onCheckedChange={() => onToggleSelect(item.id)}
          aria-label={`Select ${item.name}`}
          className="mt-1 size-[18px] shrink-0 border-gray-300 data-checked:border-[#00cbfd] data-checked:bg-[#00cbfd] sm:mt-0"
        />

        <Link
          to={`/product/${item.productId}`}
          className="block size-20 shrink-0 overflow-hidden rounded-md bg-[#f5f5f5] sm:size-24"
        >
          <img src={item.image} alt={item.name} className="size-full object-cover" loading="lazy" />
        </Link>

        <div className="min-w-0 flex-1">
          <Link to={`/product/${item.productId}`} className="block">
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[#2b2f32] sm:text-base">
              {item.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-[#757575] sm:text-sm">{item.variant}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-gray-200 bg-[#fafafa]">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onUpdateQuantity(item.id, -1)}
                disabled={item.quantity <= 1}
                aria-label="Decrease quantity"
                className="size-8 rounded-none text-[#757575] hover:bg-white disabled:opacity-40"
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="min-w-8 px-1 text-center text-sm font-medium text-[#2b2f32]">
                {item.quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onUpdateQuantity(item.id, 1)}
                aria-label="Increase quantity"
                className="size-8 rounded-none text-[#757575] hover:bg-white"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="h-8 px-2 text-[#757575] hover:text-[#ee4d2d] sm:hidden"
            >
              <Trash2 className="mr-1 size-3.5" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 pl-[calc(18px+0.75rem+5rem)] sm:w-36 sm:flex-col sm:items-end sm:justify-center sm:pl-0 lg:w-40">
        <div className="text-right">
          <p className={cn("text-sm font-medium sm:text-base", storeTokens.price)}>
            {formatPrice(item.price)}
          </p>
          <p className="mt-0.5 text-xs text-[#757575] sm:hidden">x{item.quantity}</p>
        </div>
        <div className="text-right">
          <span className="hidden text-xs text-[#757575] sm:block">Line total</span>
          <p className={cn("text-sm font-semibold sm:text-base", storeTokens.price)}>
            {formatPrice(lineTotal)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
          className="hidden size-8 text-[#757575] hover:text-[#ee4d2d] sm:inline-flex"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </article>
  )
}
