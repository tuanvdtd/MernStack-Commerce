import { Link } from "react-router"
import { ChevronRight } from "lucide-react"
import { categories } from "~/mock/productData"

type HomeTopCategoriesProps = {
  onCategoryClick?: (categoryId: string) => void
}

export const HomeTopCategories = ({ onCategoryClick }: HomeTopCategoriesProps) => {
  return (
    <section className="bg-[#f5f5f5] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-8 text-center text-xl font-bold tracking-tight text-[#2b2f32] sm:text-2xl">
          Danh mục nổi bật
        </h2>

        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 sm:gap-6">
          {categories.map((cat) => {
            const content = (
              <>
                <div className="flex h-24 w-24 items-center justify-center p-2 sm:h-28 sm:w-28 sm:p-2.5">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    width={512}
                    height={512}
                    className="size-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-center text-xs font-medium text-[#2b2f32] sm:text-sm">
                  {cat.name}
                </span>
              </>
            )

            if (onCategoryClick) {
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryClick(cat.id)}
                  className="group flex flex-col items-center gap-2.5 text-left"
                >
                  {content}
                </button>
              )
            }

            return (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="group flex flex-col items-center gap-2.5"
              >
                {content}
              </Link>
            )
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/category/all"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#2b2f32]/15 bg-white px-5 text-sm font-medium text-[#2b2f32] transition-transform active:scale-[0.98] hover:border-[#00cbfd] hover:text-[#00cbfd]"
          >
            Xem tất cả danh mục
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
