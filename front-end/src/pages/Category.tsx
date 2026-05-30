import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ArrowDownAZ, ArrowUpAZ, Search, SlidersHorizontal, Star, TrendingUp } from "lucide-react"
import { ProductCard } from "~/components/ProductCard"
import { GuestCatalogFilters } from "~/components/GuestCatalogFilters"
import { allProducts, categories, priceRanges } from "~/mock/productData"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"

const categoryNames: Record<string, string> = {
  "dien-thoai": "Điện thoại",
  laptop: "Laptop",
  "tai-nghe": "Tai nghe",
  "dong-ho": "Đồng hồ",
  "may-tinh-bang": "Máy tính bảng",
  "man-hinh": "Màn hình",
  all: "Tất cả sản phẩm",
}

const sortOptions = [
  { key: "popular", label: "Phổ biến", icon: TrendingUp },
  { key: "price-asc", label: "Giá thấp", icon: ArrowDownAZ },
  { key: "price-desc", label: "Giá cao", icon: ArrowUpAZ },
  { key: "rating", label: "Đánh giá", icon: Star },
] as const

export function Category() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [priceRange, setPriceRange] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("popular")

  const currentCategory = slug || "all"
  const pageTitle = categoryNames[currentCategory] || "Khám phá danh mục"

  const handleCategoryChange = (categoryId: string) => {
    navigate(`/category/${categoryId}`)
  }

  const handleClearAllFilters = () => {
    setPriceRange(null)
    setSearchQuery("")
    navigate("/category/all")
  }

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProducts.length }

    for (const category of categories) {
      counts[category.id] = allProducts.filter((product) => product.category === category.id).length
    }

    return counts
  }, [])

  const filteredProducts = useMemo(() => {
    let products = [...allProducts]

    if (currentCategory !== "all") {
      products = products.filter((product) => product.category === currentCategory)
    }

    if (priceRange) {
      const selectedRange = priceRanges.find((range) => range.id === priceRange)

      if (selectedRange) {
        products = products.filter((product) => product.price >= selectedRange.min && product.price < selectedRange.max)
      }
    }

    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.toLowerCase().trim()
      products = products.filter((product) => product.name.toLowerCase().includes(normalizedQuery))
    }

    switch (sortBy) {
      case "price-asc":
        products.sort((firstProduct, secondProduct) => firstProduct.price - secondProduct.price)
        break
      case "price-desc":
        products.sort((firstProduct, secondProduct) => secondProduct.price - firstProduct.price)
        break
      case "rating":
        products.sort((firstProduct, secondProduct) => secondProduct.rating - firstProduct.rating)
        break
      case "popular":
      default:
        products.sort((firstProduct, secondProduct) => (secondProduct.reviews ?? 0) - (firstProduct.reviews ?? 0))
    }

    return products
  }, [currentCategory, priceRange, searchQuery, sortBy])

  const activeFilterCount = [
    currentCategory !== "all",
    priceRange !== null,
    searchQuery.trim().length > 0,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-slate-50 py-6 dark:bg-background sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-lg border border-border/80 bg-background p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Danh mục sản phẩm</p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{pageTitle}</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Duyệt sản phẩm công nghệ theo danh mục, mức giá và từ khóa. Kết quả được sắp xếp để dễ so sánh trước khi mua.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
              <div className="rounded-lg border border-border/70 bg-slate-50 px-3 py-2 dark:bg-slate-950/30">
                <span className="block text-xs text-muted-foreground">Tổng sản phẩm</span>
                <strong className="text-base text-foreground">{categoryCounts.all}</strong>
              </div>
              <div className="rounded-lg border border-border/70 bg-slate-50 px-3 py-2 dark:bg-slate-950/30">
                <span className="block text-xs text-muted-foreground">Đang hiển thị</span>
                <strong className="text-base text-foreground">{filteredProducts.length}</strong>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <GuestCatalogFilters
            categories={categories}
            priceRanges={priceRanges}
            categoryCounts={categoryCounts}
            selectedCategory={currentCategory}
            onCategoryChange={handleCategoryChange}
            selectedPriceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            resultCount={filteredProducts.length}
            activeFilterCount={activeFilterCount}
            onClearAll={handleClearAllFilters}
          />

          <main className="space-y-5">
            <section className="rounded-lg border border-border/80 bg-background p-4 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                    Sắp xếp
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {sortOptions.map((option) => {
                      const isActive = sortBy === option.key
                      const OptionIcon = option.icon

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setSortBy(option.key)}
                          className={cn(
                            "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isActive
                              ? "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
                              : "border-border/80 bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                          aria-pressed={isActive}
                        >
                          <OptionIcon className="h-3.5 w-3.5" />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="relative w-full xl:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm trong danh mục..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-9 rounded-lg bg-muted/30 pl-9 text-sm"
                    aria-label="Tìm kiếm sản phẩm trong danh mục"
                  />
                </div>
              </div>
            </section>

            {filteredProducts.length === 0 ? (
              <section className="rounded-lg border border-border/80 bg-background p-8 text-center shadow-sm sm:p-12">
                <p className="mx-auto mb-4 max-w-md text-sm font-medium leading-6 text-muted-foreground">
                  Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại. Hãy thử xóa bớt điều kiện hoặc chọn danh mục khác.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Xem tất cả sản phẩm
                </button>
              </section>
            ) : (
              <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </section>
            )}

            {filteredProducts.length > 0 && (
              <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Phân trang sản phẩm">
                <button
                  type="button"
                  className="h-9 rounded-lg border border-border/80 bg-background px-4 text-xs font-semibold text-muted-foreground transition-colors disabled:opacity-50"
                  disabled
                >
                  Trước
                </button>
                <button
                  type="button"
                  className="h-9 min-w-9 rounded-lg border border-sky-300 bg-sky-50 px-3 text-xs font-bold text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
                  aria-current="page"
                >
                  1
                </button>
                <button
                  type="button"
                  className="h-9 rounded-lg border border-border/80 bg-background px-4 text-xs font-semibold text-muted-foreground transition-colors disabled:opacity-50"
                  disabled
                >
                  Sau
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
