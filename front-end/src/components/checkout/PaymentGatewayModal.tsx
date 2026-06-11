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
    title: "Thanh toán qua Stripe",
    description: "Cổng Stripe sẽ mở tại đây sau khi tích hợp API.",
    logoSrc: "https://cdn.simpleicons.org/stripe/635bff",
    accent: "border-[#635bff]/20 bg-[#635bff]/5",
  },
  vnpay: {
    title: "Thanh toán qua VNPay",
    description: "Cổng VNPay sẽ mở tại đây sau khi tích hợp API.",
    logoSrc: VnPayLogo,
    accent: "border-[#0066b3]/20 bg-[#0066b3]/5",
  },
}

/**
 * Modal placeholder cho cổng thanh toán thẻ (Stripe / VNPay).
 * Sẽ được thay bằng widget hoặc redirect thật khi có API.
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
              Đang chờ tích hợp cổng thanh toán
            </p>
            <p className="text-center text-xs text-[#aaadb0]">
              Khu vực này sẽ hiển thị form hoặc iframe từ nhà cung cấp
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
