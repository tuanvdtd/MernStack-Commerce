import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ArrowDownAZ, ArrowUpAZ, PackageOpen, Search, SlidersHorizontal, Star, TrendingUp } from "lucide-react"
import { ProductCard } from "~/components/ProductCard"
import { GuestCatalogFilters } from "~/components/GuestCatalogFilters"
import { CategoryPageHeader } from "~/components/category/CategoryPageHeader"
import { CategoryQuickNav } from "~/components/category/CategoryQuickNav"
import { allProducts, categories, priceRanges } from "~/mock/productData"
import { storeTokens } from "~/lib/categoryTheme"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

const categoryMeta: Record<string, { title: string; description: string }> = {
  all: {
    title: "Tất cả sản phẩm",
    description: "Điện thoại, laptop, tai nghe và phụ kiện công nghệ — lọc theo giá, đánh giá và từ khóa.",
  },
  "dien-thoai": {
    title: "Điện thoại",
    description: "iPhone, Samsung Galaxy, Xiaomi chính hãng VN/A.",
  },
  laptop: {
    title: "Laptop",
    description: "MacBook, Dell XPS, gaming và ultrabook.",
  },
  "tai-nghe": {
    title: "Tai nghe",
    description: "AirPods, Sony, tai nghe true wireless và gaming.",
  },
  "dong-ho": {
    title: "Đồng hồ thông minh",
    description: "Apple Watch, Galaxy Watch, Pixel Watch.",
  },
  "may-tinh-bang": {
    title: "Máy tính bảng",
    description: "iPad, Galaxy Tab và máy tính bảng học tập.",
  },
  "man-hinh": {
    title: "Màn hình",
    description: "4K, ultrawide, gaming 144Hz+.",
  },
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
  const meta = categoryMeta[currentCategory] ?? {
    title: "Khám phá danh mục",
    description: "Duyệt thiết bị điện tử theo danh mục và bộ lọc.",
  }

  const activeCategory = categories.find((category) => category.id === currentCategory)

  const handleCategoryChange = (categoryId: string) => {
    navigate(`/category/${categoryId}`)
  }

  const handleClearPriceAndSearch = () => {
    setPriceRange(null)
    setSearchQuery("")
  }

  const handleClearAllFilters = () => {
    handleClearPriceAndSearch()
    if (currentCategory !== "all") {
      navigate("/category/all")
    }
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
        products.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        products.sort((a, b) => b.price - a.price)
        break
      case "rating":
        products.sort((a, b) => b.rating - a.rating)
        break
      default:
        products.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0))
    }

    return products
  }, [currentCategory, priceRange, searchQuery, sortBy])

  const sidebarFilterCount = [priceRange !== null, searchQuery.trim().length > 0].filter(Boolean).length

  const activeFilterCount = [
    currentCategory !== "all",
    priceRange !== null,
    searchQuery.trim().length > 0,
  ].filter(Boolean).length

  return (
    <div className={cn("min-h-screen", storeTokens.pageBg)}>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className={cn("overflow-hidden rounded-lg border shadow-sm", storeTokens.border, storeTokens.surface)}>
          <CategoryPageHeader
            title={meta.title}
            description={meta.description}
            resultCount={filteredProducts.length}
            totalCount={categoryCounts.all}
            categoryIcon={activeCategory?.icon}
            showDefaultIcon={currentCategory === "all"}
          />
          <CategoryQuickNav
            categories={categories}
            categoryCounts={categoryCounts}
            selectedCategory={currentCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <GuestCatalogFilters
            priceRanges={priceRanges}
            selectedPriceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            resultCount={filteredProducts.length}
            activeFilterCount={sidebarFilterCount}
            onClearAll={handleClearPriceAndSearch}
          />

          <div className={cn("rounded-lg border shadow-sm", storeTokens.border, storeTokens.surface)}>
            <main className="p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#2b2f32]">
                  {filteredProducts.length} sản phẩm
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-xs text-[#00647e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00cbfd]"
                  >
                    Xóa bộ lọc ({activeFilterCount})
                  </button>
                )}
              </div>

              <section className={cn("mb-3 rounded-lg border", storeTokens.border, storeTokens.bandBg)}>
                <div className={cn("flex flex-col gap-2 border-b px-3 py-2 sm:flex-row sm:items-center sm:justify-between", storeTokens.border)}>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-[#2b2f32]">
                    <SlidersHorizontal className="size-4 text-[#757575]" aria-hidden="true" />
                    Sắp xếp
                  </span>
                  <div className="relative w-full sm:max-w-[220px]">
                    <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[#757575]" aria-hidden="true" />
                    <Input
                      type="text"
                      placeholder="Tìm sản phẩm..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className={cn("h-8 rounded-md border-gray-200 bg-white pl-8 text-sm")}
                      aria-label="Tìm kiếm sản phẩm"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 p-2">
                  {sortOptions.map((option) => {
                    const isActive = sortBy === option.key
                    const OptionIcon = option.icon

                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setSortBy(option.key)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00cbfd]",
                          isActive
                            ? storeTokens.activeItem
                            : cn(storeTokens.inactiveItem, storeTokens.surface, storeTokens.border)
                        )}
                        aria-pressed={isActive}
                      >
                        <OptionIcon className="size-3" aria-hidden="true" />
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </section>

              {filteredProducts.length === 0 ? (
                <section className={cn("rounded-lg border border-dashed p-10 text-center", storeTokens.border)}>
                  <PackageOpen className="mx-auto mb-3 size-10 text-[#bdbdbd]" aria-hidden="true" />
                  <h3 className="text-base font-medium text-[#2b2f32]">Không tìm thấy sản phẩm</h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-[#757575]">
                    Thử xóa bộ lọc hoặc đổi từ khóa tìm kiếm.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={handleClearAllFilters}>
                    Xem tất cả
                  </Button>
                </section>
              ) : (
                <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      rating={product.rating}
                      reviews={product.reviews}
                    />
                  ))}
                </section>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
