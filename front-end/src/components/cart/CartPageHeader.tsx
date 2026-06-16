import { Link } from "react-router"
import { ChevronRight, ShoppingBag } from "lucide-react"
import { storeTokens } from "~/lib/categoryTheme"

type CartPageHeaderProps = {
  itemCount: number
  selectedCount: number
}

export function CartPageHeader({ itemCount, selectedCount }: CartPageHeaderProps) {
  return (
    <header className="mb-5 sm:mb-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-[#757575]"
      >
        <Link to="/" className="hover:text-[#2b2f32]">
          Home
        </Link>
        <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="font-medium text-[#2b2f32]">Cart</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${storeTokens.iconBoxActive}`}
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-[#2b2f32] sm:text-2xl">Cart</h1>
            <p className="mt-1 text-sm leading-relaxed text-[#757575]">
              {itemCount > 0
                ? `${itemCount} items - ${selectedCount} selected for checkout`
                : "No products in your cart yet"}
            </p>
          </div>
        </div>

        {itemCount > 0 && (
          <div
            className={`shrink-0 rounded-lg border ${storeTokens.border} ${storeTokens.surface} px-4 py-2.5`}
          >
            <span className="block text-xs text-[#757575]">Selected</span>
            <p className="text-lg font-semibold text-[#2b2f32]">
              {selectedCount}
              <span className="text-sm font-normal text-[#757575]"> / {itemCount} items</span>
            </p>
          </div>
        )}
      </div>
    </header>
  )
}
