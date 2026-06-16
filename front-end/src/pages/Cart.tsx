import { useEffect, useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { CartEmptyState } from "~/components/cart/CartEmptyState"
import { CartLineItem, type CartItemData } from "~/components/cart/CartLineItem"
import { CartOrderSummary } from "~/components/cart/CartOrderSummary"
import { CartPageHeader } from "~/components/cart/CartPageHeader"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { storeTokens } from "~/lib/categoryTheme"

const INITIAL_ITEMS: CartItemData[] = [
  {
    id: "1",
    productId: "iphone-16-pro",
    name: "iPhone 16 Pro 256GB",
    variant: "Natural Titanium - Official VN/A",
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    price: 28_990_000,
    quantity: 1,
    selected: true,
  },
  {
    id: "2",
    productId: "airpods-pro-2",
    name: "AirPods Pro 2 (USB-C)",
    variant: "White - Official Apple",
    image:
      "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    price: 5_990_000,
    quantity: 1,
    selected: true,
  },
  {
    id: "3",
    productId: "galaxy-watch-7",
    name: "Samsung Galaxy Watch 7 44mm LTE",
    variant: "Blue - Silicone strap",
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    price: 8_490_000,
    quantity: 2,
    selected: false,
  },
]

const formatPrice = (price: number) =>
  `${price.toLocaleString("en-US")} VND`

export function Cart() {
  const [cartItems, setCartItems] = useState<CartItemData[]>(INITIAL_ITEMS)
  const [selectAll, setSelectAll] = useState(false)
  const [voucherCode, setVoucherCode] = useState("")

  const selectedItems = useMemo(() => cartItems.filter((item) => item.selected), [cartItems])
  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected)
  const someSelected = cartItems.some((item) => item.selected)

  useEffect(() => {
    setSelectAll(allSelected)
  }, [allSelected])

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = selectedItems.length > 0 ? 35_000 : 0
  const voucherDiscount = selectedItems.length > 0 && voucherCode.trim().length > 0 ? 150_000 : 0
  const total = Math.max(0, subtotal + shipping - voucherDiscount)

  const toggleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    setCartItems((items) => items.map((item) => ({ ...item, selected: checked })))
  }

  const toggleItemSelection = (id: string) => {
    setCartItems((items) =>
      items.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    )
  }

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const removeSelected = () => {
    setCartItems((items) => items.filter((item) => !item.selected))
  }

  return (
    <div className={`min-h-[100dvh] ${storeTokens.pageBg} py-5 sm:py-6`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <CartPageHeader itemCount={cartItems.length} selectedCount={selectedItems.length} />

        {cartItems.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:gap-5 xl:grid-cols-[1fr_360px]">
            <section
              className={`overflow-hidden rounded-lg border ${storeTokens.border} ${storeTokens.surface}`}
            >
              <div
                className={`flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5 ${storeTokens.bandBg}`}
              >
                <label className="flex cursor-pointer items-center gap-2.5">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                    aria-label="Select all products"
                    className="size-[18px] border-gray-300 data-checked:border-[#00cbfd] data-checked:bg-[#00cbfd]"
                  />
                  <span className="text-sm text-[#2b2f32]">
                    Select all ({cartItems.length})
                  </span>
                </label>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeSelected}
                  disabled={!someSelected}
                  className="h-8 text-[#ee4d2d] hover:bg-[#fff5f3] hover:text-[#d73211] disabled:opacity-40"
                >
                  <Trash2 className="mr-1.5 size-3.5" aria-hidden="true" />
                  Remove selected
                </Button>
              </div>

              <div role="list">
                {cartItems.map((item) => (
                  <CartLineItem
                    key={item.id}
                    item={item}
                    onToggleSelect={toggleItemSelection}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </section>

            <CartOrderSummary
              selectedCount={selectedItems.reduce((sum, item) => sum + item.quantity, 0)}
              subtotal={subtotal}
              shipping={shipping}
              discount={voucherDiscount}
              total={total}
              voucherCode={voucherCode}
              onVoucherChange={setVoucherCode}
              formatPrice={formatPrice}
              checkoutDisabled={selectedItems.length === 0}
            />
          </div>
        )}
      </div>
    </div>
  )
}
