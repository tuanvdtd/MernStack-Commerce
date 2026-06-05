import { Link } from "react-router"
import { ShieldCheck, Tag } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { storeTokens } from "~/lib/categoryTheme"
import { cn } from "~/lib/utils"

type CartOrderSummaryProps = {
  selectedCount: number
  subtotal: number
  shipping: number
  discount: number
  total: number
  voucherCode: string
  onVoucherChange: (value: string) => void
  formatPrice: (price: number) => string
  checkoutDisabled: boolean
}

export function CartOrderSummary({
  selectedCount,
  subtotal,
  shipping,
  discount,
  total,
  voucherCode,
  onVoucherChange,
  formatPrice,
  checkoutDisabled,
}: CartOrderSummaryProps) {
  return (
    <aside
      className={`rounded-lg border ${storeTokens.border} ${storeTokens.surface} p-4 sm:p-5 lg:sticky lg:top-24`}
    >
      <h2 className="text-base font-semibold text-[#2b2f32] sm:text-lg">Tóm tắt đơn hàng</h2>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4 text-[#757575]">
          <dt>Tạm tính ({selectedCount} sản phẩm)</dt>
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
        <Label htmlFor="voucher-code" className="text-xs font-medium text-[#757575]">
          Mã giảm giá
        </Label>
        <div className="mt-1.5 flex gap-2">
          <div className="relative flex-1">
            <Tag
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#757575]"
              aria-hidden="true"
            />
            <Input
              id="voucher-code"
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
        asChild
        disabled={checkoutDisabled}
        className="mt-4 h-11 w-full bg-[#00cbfd] text-[#003e4f] hover:bg-[#00b8e6] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        <Link to={checkoutDisabled ? "#" : "/checkout"} aria-disabled={checkoutDisabled}>
          Thanh toán
        </Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className="mt-2 h-9 w-full border-gray-200 text-[#2b2f32] hover:bg-[#fafafa]"
      >
        <Link to="/category/all">Tiếp tục mua sắm</Link>
      </Button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#757575]">
        <ShieldCheck className={`size-3.5 ${storeTokens.brand}`} aria-hidden="true" />
        Thanh toán an toàn và bảo mật
      </p>
    </aside>
  )
}
