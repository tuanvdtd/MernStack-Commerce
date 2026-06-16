import { useState } from "react"
import { Link } from "react-router"
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

const ORDER_ITEMS = [
  {
    id: "1",
    name: "iPhone 16 Pro 256GB",
    variant: "Natural Titanium - Official VN/A",
    quantity: 1,
    price: 28_990_000,
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: "2",
    name: "AirPods Pro 2 (USB-C)",
    variant: "White - Official Apple",
    quantity: 1,
    price: 5_990_000,
    image:
      "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
]

const formatPrice = (price: number) =>
  `${price.toLocaleString("en-US")} VND`

export function Checkout() {
  const [paymentType, setPaymentType] = useState<PaymentType>("cod")
  const [cardProvider, setCardProvider] = useState<CardProvider>("stripe")
  const [voucherCode, setVoucherCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gatewayOpen, setGatewayOpen] = useState(false)
  const [activeGateway, setActiveGateway] = useState<CardProvider | null>(null)

  const subtotal = ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 35_000
  const voucherDiscount = voucherCode.trim().length > 0 ? 150_000 : 0
  const total = Math.max(0, subtotal + shipping - voucherDiscount)

  /**
   * Place the order: COD completes immediately; cards open the selected gateway modal.
   */
  const handlePlaceOrder = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      if (paymentType === "cod") {
        await new Promise((resolve) => window.setTimeout(resolve, 600))
        toast.success("Order placed successfully!", {
          description: "Your COD order has been recorded. The courier will contact you soon.",
        })
        return
      }

      setActiveGateway(cardProvider)
      setGatewayOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

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
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  Edit
                </Button>
              </div>

              <div className="mt-4 rounded-lg border border-gray-100 bg-[#fafafa] p-4">
                <p className="font-medium text-[#2b2f32]">Minh Tuan Nguyen</p>
                <p className="mt-1 text-sm leading-relaxed text-[#757575]">
                  42 Nguyen Hue, Ben Nghe Ward
                  <br />
                  District 1, Ho Chi Minh City
                </p>
                <p className="mt-2 text-sm text-[#2b2f32]">0903 847 192</p>
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
                Products ({ORDER_ITEMS.length})
              </h2>

              <ul className="mt-4 space-y-4">
                {ORDER_ITEMS.map((item) => (
                  <li key={item.id} className="flex gap-3 sm:gap-4">
                    <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-[#f0f0f0] sm:size-24">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-medium leading-snug text-[#2b2f32]">
                          {item.name}
                        </h3>
                        <span className={cn("shrink-0 text-sm font-semibold", storeTokens.price)}>
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#757575]">{item.variant}</p>
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
            itemCount={ORDER_ITEMS.reduce((sum, item) => sum + item.quantity, 0)}
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
