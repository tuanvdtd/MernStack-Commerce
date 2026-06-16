import { Link } from "react-router"
import type { LucideIcon } from "lucide-react"
import { ChevronRight, LayoutGrid, ShieldCheck, Truck, Zap } from "lucide-react"
import { storeTokens } from "~/lib/categoryTheme"

type CategoryPageHeaderProps = {
  title: string
  description: string
  resultCount: number
  totalCount: number
  categoryIcon?: LucideIcon
  showDefaultIcon?: boolean
}

export const CategoryPageHeader = ({
  title,
  description,
  resultCount,
  totalCount,
  categoryIcon: CategoryIcon,
  showDefaultIcon = false,
}: CategoryPageHeaderProps) => {
  const DisplayIcon = CategoryIcon ?? (showDefaultIcon ? LayoutGrid : null)

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-[#757575]">
        <Link to="/">Home</Link>
        <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
        <Link to="/category/all">Categories</Link>
        <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="font-medium text-[#2b2f32]">{title}</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          {DisplayIcon && (
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${storeTokens.iconBoxActive}`}>
              <DisplayIcon className="size-6" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-[#2b2f32] sm:text-2xl">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#757575]">{description}</p>
          </div>
        </div>

        <div className={`shrink-0 rounded-lg border ${storeTokens.border} ${storeTokens.surface} px-4 py-2.5`}>
          <span className="block text-xs text-[#757575]">Showing</span>
          <p className="text-lg font-semibold text-[#2b2f32]">
            {resultCount}
            <span className="text-sm font-normal text-[#757575]"> / {totalCount}</span>
          </p>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {[
          { icon: ShieldCheck, label: "100% authentic" },
          { icon: Truck, label: "2-hour fast delivery" },
          { icon: Zap, label: "Daily flash sales" },
        ].map(({ icon: Icon, label }) => (
          <li
            key={label}
            className={`inline-flex items-center gap-1.5 rounded-md border ${storeTokens.border} ${storeTokens.surface} px-2.5 py-1 text-xs text-[#757575]`}
          >
            <Icon className={`size-3.5 ${storeTokens.brand}`} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}
