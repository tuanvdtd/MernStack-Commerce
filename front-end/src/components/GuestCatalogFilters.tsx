import { Link } from "react-router"
import type { LucideIcon } from "lucide-react"
import {
  Banknote,
  Check,
  Filter,
  LayoutGrid,
  LogIn,
  RotateCcw,
  Tag,
  X,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"

type CategoryItem = {
  id: string
  name: string
  icon: LucideIcon
  color: string
}

type PriceRangeItem = {
  id: string
  label: string
}

type GuestCatalogFiltersProps = {
  categories: CategoryItem[]
  priceRanges: PriceRangeItem[]
  categoryCounts: Record<string, number>
  selectedCategory: string
  onCategoryChange: (id: string) => void
  selectedPriceRange: string | null
  onPriceRangeChange: (id: string | null) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  resultCount: number
  activeFilterCount: number
  onClearAll: () => void
}

const categoryIconStyles: Record<string, string> = {
  "dien-thoai": "bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900",
  laptop: "bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900",
  "dong-ho": "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
  "tai-nghe": "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  "may-tinh-bang": "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900",
  "man-hinh": "bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900",
}

export function GuestCatalogFilters({
  categories,
  priceRanges,
  categoryCounts,
  selectedCategory,
  onCategoryChange,
  selectedPriceRange,
  onPriceRangeChange,
  searchQuery,
  onSearchQueryChange,
  resultCount,
  activeFilterCount,
  onClearAll,
}: GuestCatalogFiltersProps) {
  const selectedCategoryName = categories.find((category) => category.id === selectedCategory)?.name
  const selectedPriceRangeLabel = priceRanges.find((range) => range.id === selectedPriceRange)?.label
  const hasActiveFilters = activeFilterCount > 0

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <Card className="gap-0 overflow-hidden rounded-lg border-border/80 bg-background pt-0 pb-0 shadow-sm">
        <div className="border-b border-border/70 bg-card px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-border">
                <Filter className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">Bộ lọc sản phẩm</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{resultCount} sản phẩm phù hợp</p>
              </div>
            </div>

            {hasActiveFilters && (
              <Badge variant="outline" className="h-6 shrink-0 rounded-md border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
                {activeFilterCount} lọc
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-0">
          {hasActiveFilters && (
            <div className="border-b border-border/70 bg-slate-50 px-4 py-3 dark:bg-slate-950/30">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Đang áp dụng</span>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sky-300 dark:hover:text-sky-200"
                >
                  <RotateCcw className="h-3 w-3" />
                  Xóa tất cả
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selectedCategory !== "all" && selectedCategoryName && (
                  <FilterChip label={selectedCategoryName} onRemove={() => onCategoryChange("all")} removeLabel="Bỏ lọc danh mục" />
                )}
                {selectedPriceRange && selectedPriceRangeLabel && (
                  <FilterChip label={selectedPriceRangeLabel} onRemove={() => onPriceRangeChange(null)} removeLabel="Bỏ lọc giá" />
                )}
                {searchQuery.trim() && (
                  <FilterChip label={`"${searchQuery.trim()}"`} onRemove={() => onSearchQueryChange("")} removeLabel="Xóa từ khóa" />
                )}
              </div>
            </div>
          )}

          <div className="border-b border-border/70 p-4">
            <div className="mb-3 flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-foreground">Danh mục</h4>
            </div>

            <button
              type="button"
              onClick={() => onCategoryChange("all")}
              className={cn(
                "mb-2 flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selectedCategory === "all"
                  ? "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
                  : "border-transparent bg-muted/30 text-foreground hover:border-border hover:bg-muted/60"
              )}
              aria-pressed={selectedCategory === "all"}
            >
              <span className="flex items-center gap-2 font-medium">
                {selectedCategory === "all" && <Check className="h-4 w-4" />}
                Tất cả sản phẩm
              </span>
              <span className="rounded-md bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground ring-1 ring-border/70">
                {categoryCounts.all}
              </span>
            </button>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
              {categories.map((category) => {
                const isActive = selectedCategory === category.id
                const CategoryIcon = category.icon

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onCategoryChange(category.id)}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
                        : "border-transparent bg-background hover:border-border hover:bg-muted/50"
                    )}
                    aria-pressed={isActive}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
                        categoryIconStyles[category.id] ?? "bg-slate-100 text-slate-700 ring-slate-200"
                      )}
                    >
                      <CategoryIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium leading-tight">{category.name}</span>
                      <span className="text-xs text-muted-foreground">{categoryCounts[category.id]} sản phẩm</span>
                    </span>
                    {isActive && <Check className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-b border-border/70 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-foreground">Khoảng giá</h4>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {priceRanges.map((range) => {
                const isActive = selectedPriceRange === range.id

                return (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => onPriceRangeChange(isActive ? null : range.id)}
                    className={cn(
                      "min-h-12 rounded-lg border px-3 py-2 text-left text-xs font-medium leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
                        : "border-border/80 bg-background hover:bg-muted/50"
                    )}
                    aria-pressed={isActive}
                  >
                    <span className="flex items-start justify-between gap-2">
                      {range.label}
                      {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-sky-700 dark:text-sky-300" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 dark:bg-slate-950/30">
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-background px-3 py-2 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                Kết quả
              </span>
              <span className="font-semibold text-foreground">{resultCount} sản phẩm</span>
            </div>

            {hasActiveFilters ? (
              <Button variant="outline" size="sm" className="h-9 w-full rounded-lg border-dashed" onClick={onClearAll}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            ) : (
              <p className="text-center text-xs leading-relaxed text-muted-foreground">Chọn danh mục, khoảng giá hoặc nhập từ khóa để thu hẹp danh sách.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden rounded-lg border-border/80 bg-card pt-0 pb-0 shadow-sm">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <LogIn className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Muốn mua hàng?</p>
              <p className="text-xs text-muted-foreground">Đăng nhập để dùng giỏ hàng.</p>
            </div>
          </div>
          <Button size="sm" className="h-9 w-full rounded-lg" asChild>
            <Link to="/login">Đăng nhập ngay</Link>
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
  <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-sky-200 bg-background py-1 pl-2 pr-1 text-xs font-medium text-sky-800 dark:border-sky-900 dark:text-sky-200">
    <span className="truncate">{label}</span>
    <button
      type="button"
      onClick={onRemove}
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-sky-950"
      aria-label={removeLabel}
    >
      <X className="h-3 w-3" />
    </button>
  </span>
)
