import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { cn } from "~/lib/utils"
import VnPayLogo from "~/assets/vnpay.png";

export type CardProvider = "stripe" | "vnpay"

type PaymentGatewayModalProps = {
  provider: CardProvider | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const providerMeta: Record<
  CardProvider,
  { title: string; description: string; logoSrc: string; accent: string }
> = {
  stripe: {
    title: "Pay with Stripe",
    description: "The Stripe gateway will open here after the API is integrated.",
    logoSrc: "https://cdn.simpleicons.org/stripe/635bff",
    accent: "border-[#635bff]/20 bg-[#635bff]/5",
  },
  vnpay: {
    title: "Pay with VNPay",
    description: "The VNPay gateway will open here after the API is integrated.",
    logoSrc: VnPayLogo,
    accent: "border-[#0066b3]/20 bg-[#0066b3]/5",
  },
}

/**
 * Placeholder modal for card payment gateways (Stripe / VNPay).
 * This will be replaced by a real widget or redirect when the API is available.
 */
export function PaymentGatewayModal({
  provider,
  open,
  onOpenChange,
}: PaymentGatewayModalProps) {
  if (!provider) return null

  const meta = providerMeta[provider]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#2b2f32]">
            {meta.title}
          </DialogTitle>
          <DialogDescription className="text-[#757575]">
            {meta.description}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "flex flex-col items-center gap-4 rounded-lg border p-6",
            meta.accent
          )}
        >
          <img
            src={meta.logoSrc}
            alt={provider === "stripe" ? "Stripe" : "VNPay"}
            className="h-8 w-auto object-contain"
          />
          <div className="flex w-full flex-col items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white p-8">
            <Loader2 className="size-8 animate-spin text-[#757575]" aria-hidden="true" />
            <p className="text-center text-sm text-[#757575]">
              Waiting for payment gateway integration
            </p>
            <p className="text-center text-xs text-[#aaadb0]">
              This area will display the provider form or iframe
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
