import type { LucideIcon } from "lucide-react"
import { LayoutGrid } from "lucide-react"
import { cn } from "~/lib/utils"
import { getCategoryIconAccent, storeTokens } from "~/lib/categoryTheme"

type CategoryItem = {
  id: string
  name: string
  icon: LucideIcon
}

type CategoryQuickNavProps = {
  categories: CategoryItem[]
  categoryCounts: Record<string, number>
  selectedCategory: string
  onCategoryChange: (id: string) => void
}

export const CategoryQuickNav = ({
  categories,
  categoryCounts,
  selectedCategory,
  onCategoryChange,
}: CategoryQuickNavProps) => {
  const items = [{ id: "all", name: "All", icon: LayoutGrid }, ...categories]

  return (
    <div className={cn("border-t border-gray-200 px-4 py-3 sm:px-6", storeTokens.bandBg)}>
      <div
        className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Quick category selector"
      >
        {items.map((item) => {
          const isActive = selectedCategory === item.id
          const ItemIcon = item.icon

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onCategoryChange(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00cbfd]",
                isActive
                  ? storeTokens.activeItem
                  : cn(storeTokens.inactiveItem, storeTokens.surface, storeTokens.border)
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded",
                  getCategoryIconAccent(item.id, isActive)
                )}
              >
                <ItemIcon className="size-3.5" aria-hidden="true" />
              </span>
              <span>{item.name}</span>
              <span className="text-xs text-[#757575]">({categoryCounts[item.id] ?? 0})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
