import { Banknote, CreditCard } from "lucide-react"
import { Label } from "~/components/ui/label"
import { storeTokens } from "~/lib/categoryTheme"
import { cn } from "~/lib/utils"
import type { CardProvider } from "./PaymentGatewayModal"
import VnPayLogo from "~/assets/vnpay.png";

export type PaymentType = "cod" | "card"

type CheckoutPaymentSectionProps = {
  paymentType: PaymentType
  cardProvider: CardProvider
  onPaymentTypeChange: (type: PaymentType) => void
  onCardProviderChange: (provider: CardProvider) => void
}

const cardProviders: { id: CardProvider; label: string; logoSrc: string }[] = [
  { id: "stripe", label: "Stripe", logoSrc: "https://cdn.simpleicons.org/stripe/635bff" },
  { id: "vnpay", label: "VNPay", logoSrc: VnPayLogo },
]

/**
 * Choose a payment method: COD or card (Stripe / VNPay).
 */
export function CheckoutPaymentSection({
  paymentType,
  cardProvider,
  onPaymentTypeChange,
  onCardProviderChange,
}: CheckoutPaymentSectionProps) {
  return (
    <section
      className={cn(
        "rounded-lg border p-4 sm:p-5",
        storeTokens.border,
        storeTokens.surface
      )}
    >
      <h2 className="text-base font-semibold text-[#2b2f32] sm:text-lg">
        Payment method
      </h2>
      <p className="mt-1 text-sm text-[#757575]">
        Choose how you want to pay for this order.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onPaymentTypeChange("cod")}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors active:scale-[0.99]",
            paymentType === "cod"
              ? "border-[#00cbfd] bg-[#e8f9fd]"
              : "border-gray-200 bg-white hover:border-gray-300"
          )}
        >
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              paymentType === "cod" ? storeTokens.iconBoxActive : storeTokens.iconBox
            )}
          >
            <Banknote className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[#2b2f32]">
              Cash on delivery (COD)
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-[#757575]">
              Pay in cash or scan a code when the courier arrives
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onPaymentTypeChange("card")}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors active:scale-[0.99]",
            paymentType === "card"
              ? "border-[#00cbfd] bg-[#e8f9fd]"
              : "border-gray-200 bg-white hover:border-gray-300"
          )}
        >
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              paymentType === "card" ? storeTokens.iconBoxActive : storeTokens.iconBox
            )}
          >
            <CreditCard className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[#2b2f32]">
              Pay by card
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-[#757575]">
              Credit cards, debit cards, or wallets through a payment gateway
            </span>
          </span>
        </button>
      </div>

      {paymentType === "card" && (
        <div className="mt-4 rounded-lg border border-gray-100 bg-[#fafafa] p-4">
          <Label className="text-xs font-medium text-[#757575]">Choose payment gateway</Label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {cardProviders.map((provider) => {
              const selected = cardProvider === provider.id
              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => onCardProviderChange(provider.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors active:scale-[0.99]",
                    selected
                      ? "border-[#00cbfd] bg-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <img
                    src={provider.logoSrc}
                    alt={provider.label}
                    className="h-5 w-auto object-contain"
                  />
                  <span className="text-sm font-medium text-[#2b2f32]">{provider.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
