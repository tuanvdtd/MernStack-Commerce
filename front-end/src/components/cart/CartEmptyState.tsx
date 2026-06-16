import { Link } from "react-router"
import { PackageOpen, ShoppingBag } from "lucide-react"
import { Button } from "~/components/ui/button"
import { storeTokens } from "~/lib/categoryTheme"

export function CartEmptyState() {
  return (
    <div
      className={`flex flex-col items-center rounded-lg border ${storeTokens.border} ${storeTokens.surface} px-6 py-16 text-center sm:py-20`}
    >
      <div className={`mb-5 flex size-16 items-center justify-center rounded-full ${storeTokens.brandTint}`}>
        <PackageOpen className={`size-8 ${storeTokens.brand}`} aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-[#2b2f32] sm:text-xl">Your cart is empty</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#757575]">
        Add phones, laptops, or tech accessories to start shopping on FlashBuy.
      </p>
      <Button
        asChild
        className="mt-6 h-10 bg-[#00cbfd] px-6 text-[#003e4f] hover:bg-[#00b8e6] active:scale-[0.98]"
      >
        <Link to="/category/all">
          <ShoppingBag className="mr-2 size-4" aria-hidden="true" />
          Explore products
        </Link>
      </Button>
    </div>
  )
}
