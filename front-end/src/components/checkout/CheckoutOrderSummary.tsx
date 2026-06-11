import { ShieldCheck, Tag } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { storeTokens } from "~/lib/categoryTheme"
import { cn } from "~/lib/utils"

type CheckoutOrderSummaryProps = {
  itemCount: number
  subtotal: number
  shipping: number
  discount: number
  total: number
  voucherCode: string
  onVoucherChange: (value: string) => void
  formatPrice: (price: number) => string
  onPlaceOrder: () => void
  isSubmitting: boolean
}

/**
 * Sidebar tóm tắt đơn hàng và nút đặt hàng trên trang checkout.
 */
export function CheckoutOrderSummary({
  itemCount,
  subtotal,
  shipping,
  discount,
  total,
  voucherCode,
  onVoucherChange,
  formatPrice,
  onPlaceOrder,
  isSubmitting,
}: CheckoutOrderSummaryProps) {
  return (
    <aside
      className={cn(
        "rounded-lg border p-4 sm:p-5 lg:sticky lg:top-24",
        storeTokens.border,
        storeTokens.surface
      )}
    >
      <h2 className="text-base font-semibold text-[#2b2f32] sm:text-lg">Tóm tắt thanh toán</h2>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4 text-[#757575]">
          <dt>Tạm tính ({itemCount} sản phẩm)</dt>
          <dd className="font-medium text-[#2b2f32]">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-[#757575]">
          <dt>Phí vận chuyển</dt>
          <dd className="font-medium text-[#2b2f32]">
            {shipping === 0 ? "Miễn phí" : formatPrice(shipping)}
          </dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between gap-4 text-[#757575]">
            <dt>Giảm giá voucher</dt>
            <dd className="font-medium text-[#ee4d2d]">-{formatPrice(discount)}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4">
        <Label htmlFor="checkout-voucher" className="text-xs font-medium text-[#757575]">
          Mã giảm giá
        </Label>
        <div className="mt-1.5 flex gap-2">
          <div className="relative flex-1">
            <Tag
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#757575]"
              aria-hidden="true"
            />
            <Input
              id="checkout-voucher"
              value={voucherCode}
              onChange={(e) => onVoucherChange(e.target.value)}
              placeholder="Nhập mã voucher"
              className="h-9 border-gray-200 pl-8 text-sm placeholder:text-[#aaadb0] focus-visible:border-[#00cbfd] focus-visible:ring-[#00cbfd]/30"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 border-gray-200 px-3 text-[#2b2f32] hover:bg-[#fafafa]"
          >
            Áp dụng
          </Button>
        </div>
      </div>

      <Separator className="my-4 bg-gray-100" />

      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold text-[#2b2f32] sm:text-base">Tổng thanh toán</span>
        <span className={cn("text-xl font-bold sm:text-2xl", storeTokens.price)}>
          {formatPrice(total)}
        </span>
      </div>

      <Button
        type="button"
        disabled={isSubmitting}
        onClick={onPlaceOrder}
        className="mt-4 h-11 w-full bg-[#00cbfd] text-[#003e4f] hover:bg-[#00b8e6] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
      </Button>

      <p className="mt-3 text-center text-xs leading-relaxed text-[#757575]">
        Bằng việc đặt hàng, bạn đồng ý với Điều khoản sử dụng của FlashBuy.
      </p>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#757575]">
        <ShieldCheck className={cn("size-3.5", storeTokens.brand)} aria-hidden="true" />
        Thanh toán an toàn và bảo mật
      </p>
    </aside>
  )
}
