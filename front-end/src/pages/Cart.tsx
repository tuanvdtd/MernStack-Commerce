import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { CartEmptyState } from "~/components/cart/CartEmptyState"
import { CartLineItem, type CartItemData } from "~/components/cart/CartLineItem"
import { CartOrderSummary } from "~/components/cart/CartOrderSummary"
import { CartPageHeader } from "~/components/cart/CartPageHeader"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { storeTokens } from "~/lib/categoryTheme"
import {
  fetchCart,
  removeCartItem,
  selectAllCartItems,
  updateCartItem,
  type Cart as CartData,
} from "~/apis/cartApi"

const formatPrice = (price: number) => `${price.toLocaleString("en-US")} VND`

const EMPTY_CART: CartData = { id: null, items: [], countProduct: 0 }

function toCartItemData(cart: CartData): CartItemData[] {
  return cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.productName,
    variant: item.variantLabel,
    image: item.imageUrl ?? "",
    price: item.price,
    quantity: item.quantity,
    selected: item.selected,
  }))
}

export function Cart() {
  const [cart, setCart] = useState<CartData>(EMPTY_CART)
  const [voucherCode, setVoucherCode] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCart()
      .then(setCart)
      .finally(() => setIsLoading(false))
  }, [])

  const cartItems = toCartItemData(cart)
  const selectedItems = cartItems.filter((item) => item.selected)
  const selectAll = cartItems.length > 0 && cartItems.every((item) => item.selected)
  const someSelected = cartItems.some((item) => item.selected)

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = selectedItems.length > 0 ? 35_000 : 0
  const voucherDiscount = selectedItems.length > 0 && voucherCode.trim().length > 0 ? 150_000 : 0
  const total = Math.max(0, subtotal + shipping - voucherDiscount)

  const toggleSelectAll = async (checked: boolean) => {
    setCart(await selectAllCartItems(checked))
  }

  const toggleItemSelection = async (id: string) => {
    const item = cart.items.find((i) => i.id === id)
    if (!item) return
    setCart(await updateCartItem(id, { selected: !item.selected }))
  }

  const updateQuantity = async (id: string, delta: number) => {
    const item = cart.items.find((i) => i.id === id)
    if (!item) return
    setCart(await updateCartItem(id, { quantity: Math.max(1, item.quantity + delta) }))
  }

  const removeItem = async (id: string) => {
    setCart(await removeCartItem(id))
  }

  const removeSelected = async () => {
    const selectedIds = cart.items.filter((i) => i.selected).map((i) => i.id)
    let updated = cart
    for (const id of selectedIds) {
      updated = await removeCartItem(id)
    }
    setCart(updated)
  }

  if (isLoading) return null

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
