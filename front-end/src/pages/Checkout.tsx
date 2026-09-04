import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { ChevronRight, MapPin, Package, Pencil } from "lucide-react"
import { toast } from "sonner"
import { CheckoutOrderSummary } from "~/components/checkout/CheckoutOrderSummary"
import {
  CheckoutPaymentSection,
  type PaymentType,
} from "~/components/checkout/CheckoutPaymentSection"
import {
  PaymentGatewayModal,
  type CardProvider,
} from "~/components/checkout/PaymentGatewayModal"
import { Button } from "~/components/ui/button"
import { storeTokens } from "~/lib/categoryTheme"
import { cn } from "~/lib/utils"
import { fetchCart, type Cart } from "~/apis/cartApi"
import { fetchAddresses, type Address } from "~/apis/addressApi"
import { checkout as submitCheckout } from "~/apis/checkoutApi"

const formatPrice = (price: number) => `${price.toLocaleString("en-US")} VND`

// Rough preview only — mirrors the back-end SHIPPING_FLAT_FEE default. The authoritative
// total (including the real fee) is always recomputed server-side in POST /checkout.
const SHIPPING_FEE_PREVIEW = 30_000

export function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<Cart>({ id: null, items: [], countProduct: 0 })
  const [address, setAddress] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentType, setPaymentType] = useState<PaymentType>("cod")
  const [cardProvider, setCardProvider] = useState<CardProvider>("stripe")
  const [voucherCode, setVoucherCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gatewayOpen, setGatewayOpen] = useState(false)
  const [activeGateway, setActiveGateway] = useState<CardProvider | null>(null)

  useEffect(() => {
    Promise.all([fetchCart(), fetchAddresses()])
      .then(([cartData, addresses]) => {
        setCart(cartData)
        setAddress(addresses.find((a) => a.isDefault) ?? addresses[0] ?? null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const orderItems = cart.items.filter((item) => item.selected)
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = orderItems.length > 0 ? SHIPPING_FEE_PREVIEW : 0
  const voucherDiscount = orderItems.length > 0 && voucherCode.trim().length > 0 ? 150_000 : 0
  const total = Math.max(0, subtotal + shipping - voucherDiscount)

  const handlePlaceOrder = async () => {
    if (isSubmitting || orderItems.length === 0) return

    if (!address) {
      toast.error("Please add a shipping address first")
      return
    }

    if (paymentType === "card") {
      setActiveGateway(cardProvider)
      setGatewayOpen(true)
      return
    }

    setIsSubmitting(true)
    try {
      const order = await submitCheckout({
        addressId: address.id,
        paymentMethod: "cod",
        discountCode: voucherCode.trim() || undefined,
      })
      toast.success("Order placed successfully!", {
        description: `Order ${order.orderNumber} has been recorded.`,
      })
      navigate("/account/orders")
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message ?? "Failed to place order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return null

  return (
    <div className={cn("min-h-screen py-6 sm:py-8", storeTokens.pageBg)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mb-5 sm:mb-6">
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-[#757575]"
          >
            <Link to="/" className="hover:text-[#2b2f32]">
              Home
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <Link to="/cart" className="hover:text-[#2b2f32]">
              Cart
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="font-medium text-[#2b2f32]">Checkout</span>
          </nav>

          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-lg",
                storeTokens.iconBoxActive
              )}
            >
              <Package className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-[#2b2f32] sm:text-2xl">Checkout</h1>
              <p className="mt-1 text-sm leading-relaxed text-[#757575]">
                Review your address, products, and payment method before placing the order.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4 sm:space-y-5">
            {/* Shipping address */}
            <section
              className={cn(
                "rounded-lg border p-4 sm:p-5",
                storeTokens.border,
                storeTokens.surface
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg",
                      storeTokens.iconBoxActive
                    )}
                  >
                    <MapPin className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-[#2b2f32] sm:text-lg">
                      Shipping address
                    </h2>
                    <p className="mt-1 text-sm text-[#757575]">Delivery in 2-4 business days</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-[#00647e] hover:bg-[#e8f9fd] hover:text-[#00576e]"
                  asChild
                >
                  <Link to="/account/addresses">
                    <Pencil className="size-3.5" aria-hidden="true" />
                    {address ? "Edit" : "Add"}
                  </Link>
                </Button>
              </div>

              <div className="mt-4 rounded-lg border border-gray-100 bg-[#fafafa] p-4">
                {address ? (
                  <>
                    <p className="font-medium text-[#2b2f32]">{address.recipientName}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#757575]">
                      {address.detail}, {address.wardName}
                      <br />
                      {address.provinceName}
                    </p>
                    <p className="mt-2 text-sm text-[#2b2f32]">{address.phone}</p>
                  </>
                ) : (
                  <p className="text-sm text-[#757575]">
                    You don't have a saved address yet. Add one to continue checkout.
                  </p>
                )}
              </div>
            </section>

            {/* Products */}
            <section
              className={cn(
                "rounded-lg border p-4 sm:p-5",
                storeTokens.border,
                storeTokens.surface
              )}
            >
              <h2 className="text-base font-semibold text-[#2b2f32] sm:text-lg">
                Products ({orderItems.length})
              </h2>

              <ul className="mt-4 space-y-4">
                {orderItems.map((item) => (
                  <li key={item.id} className="flex gap-3 sm:gap-4">
                    <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-[#f0f0f0] sm:size-24">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-medium leading-snug text-[#2b2f32]">
                          {item.productName}
                        </h3>
                        <span className={cn("shrink-0 text-sm font-semibold", storeTokens.price)}>
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#757575]">{item.variantLabel}</p>
                      <p className="mt-2 inline-block rounded bg-[#f0f0f0] px-2 py-0.5 text-xs text-[#757575]">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <CheckoutPaymentSection
              paymentType={paymentType}
              cardProvider={cardProvider}
              onPaymentTypeChange={setPaymentType}
              onCardProviderChange={setCardProvider}
            />
          </div>

          <CheckoutOrderSummary
            itemCount={orderItems.reduce((sum, item) => sum + item.quantity, 0)}
            subtotal={subtotal}
            shipping={shipping}
            discount={voucherDiscount}
            total={total}
            voucherCode={voucherCode}
            onVoucherChange={setVoucherCode}
            formatPrice={formatPrice}
            onPlaceOrder={handlePlaceOrder}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <PaymentGatewayModal
        provider={activeGateway}
        open={gatewayOpen}
        onOpenChange={setGatewayOpen}
      />
    </div>
  )
}
