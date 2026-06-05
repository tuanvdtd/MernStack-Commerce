import { Link } from "react-router"
import { Banknote, Filter, LogIn, Tag, X } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"
import { storeTokens } from "~/lib/categoryTheme"

type PriceRangeItem = {
  id: string
  label: string
}

type GuestCatalogFiltersProps = {
  priceRanges: PriceRangeItem[]
  selectedPriceRange: string | null
  onPriceRangeChange: (id: string | null) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  resultCount: number
  activeFilterCount: number
  onClearAll: () => void
}

export function GuestCatalogFilters({
  priceRanges,
  selectedPriceRange,
  onPriceRangeChange,
  searchQuery,
  onSearchQueryChange,
  resultCount,
  activeFilterCount,
  onClearAll,
}: GuestCatalogFiltersProps) {
  const selectedPriceRangeLabel = priceRanges.find((range) => range.id === selectedPriceRange)?.label
  const hasActiveFilters = activeFilterCount > 0

  return (
    <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
      <Card className={cn("gap-0 overflow-hidden rounded-lg border pt-0 pb-0 shadow-none", storeTokens.border, storeTokens.surface)}>
        <div className={cn("border-b px-4 py-3", storeTokens.border, storeTokens.bandBg)}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={cn("flex size-8 items-center justify-center rounded", storeTokens.iconBox)}>
                <Filter className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#2b2f32]">Khoảng giá</h3>
                <p className="text-xs text-[#757575]">{resultCount} sản phẩm</p>
              </div>
            </div>
            {hasActiveFilters && (
              <Badge variant="secondary" className="h-5 rounded bg-[#ee4d2d] text-white hover:bg-[#ee4d2d]">
                {activeFilterCount}
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-0">
          {hasActiveFilters && (
            <div className={cn("border-b px-4 py-3", storeTokens.border)}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-[#2b2f32]">Đang lọc</span>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-xs text-[#00647e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00cbfd]"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedPriceRange && selectedPriceRangeLabel && (
                  <FilterChip label={selectedPriceRangeLabel} onRemove={() => onPriceRangeChange(null)} removeLabel="Bỏ lọc giá" />
                )}
                {searchQuery.trim() && (
                  <FilterChip label={`"${searchQuery.trim()}"`} onRemove={() => onSearchQueryChange("")} removeLabel="Xóa từ khóa" />
                )}
              </div>
            </div>
          )}

          <div className="p-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#2b2f32]">
              <Banknote className="size-4 text-[#757575]" aria-hidden="true" />
              Chọn mức giá
            </h4>
            <div className="grid grid-cols-1 gap-1.5">
              {priceRanges.map((range) => {
                const isActive = selectedPriceRange === range.id

                return (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => onPriceRangeChange(isActive ? null : range.id)}
                    className={cn(
                      "rounded-md border px-2.5 py-2 text-left text-xs font-medium transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00cbfd]",
                      isActive ? storeTokens.activeItem : cn(storeTokens.inactiveItem, storeTokens.border, storeTokens.surface)
                    )}
                    aria-pressed={isActive}
                  >
                    {range.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className={cn("border-t p-3", storeTokens.border)}>
            <div className={cn("flex items-center justify-between rounded-md border px-2.5 py-2 text-xs", storeTokens.border)}>
              <span className="flex items-center gap-1 text-[#757575]">
                <Tag className="size-3.5" aria-hidden="true" />
                Kết quả
              </span>
              <span className="font-semibold text-[#2b2f32]">{resultCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cn("gap-0 overflow-hidden rounded-lg border pt-0 pb-0 shadow-none", storeTokens.border, storeTokens.brandTint)}>
        <CardContent className="p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className={cn("flex size-7 items-center justify-center rounded", storeTokens.iconBoxActive)}>
              <LogIn className="size-3.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#2b2f32]">Đăng nhập để mua</p>
              <p className="text-xs text-[#757575]">Giỏ hàng & voucher thành viên</p>
            </div>
          </div>
          <Button
            size="sm"
            className="h-8 w-full rounded-md border-0 !bg-[#00cbfd] !text-[#003e4f]"
            asChild
          >
            <Link to="/login">Đăng nhập</Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  )
}

type FilterChipProps = {
  label: string
  onRemove: () => void
  removeLabel: string
}

const FilterChip = ({ label, onRemove, removeLabel }: FilterChipProps) => (
  <span className={cn("inline-flex max-w-full items-center gap-1 rounded border py-0.5 pl-2 pr-0.5 text-xs text-[#2b2f32]", storeTokens.border, storeTokens.surface)}>
    <span className="truncate">{label}</span>
    <button
      type="button"
      onClick={onRemove}
      className="flex size-4 items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00cbfd]"
      aria-label={removeLabel}
    >
      <X className="size-3" aria-hidden="true" />
    </button>
  </span>
)
