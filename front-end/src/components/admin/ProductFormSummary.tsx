import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { formatVnd } from "~/lib/admin/ui"
import { findCategoryById } from "~/lib/admin/categoryCatalog"
import { getCatalogLabel, type OptionCatalogEntry } from "~/lib/admin/optionCatalog"
import type { AdminCategory } from "~/types/admin/index"
import { cn } from "~/lib/utils"

type ProductFormSummaryProps = {
  name: string
  slug: string
  categoryId: string
  categoryCatalog: AdminCategory[]
  brand: string
  isActive: boolean
  imgUrl: string
  optionAxes: string[]
  optionCatalog: OptionCatalogEntry[]
  skuCount: number
  minPrice: number
  maxPrice: number
  totalStock: number
  className?: string
}

export const ProductFormSummary = ({
  name,
  slug,
  categoryId,
  categoryCatalog,
  brand,
  isActive,
  imgUrl,
  optionAxes,
  optionCatalog,
  skuCount,
  minPrice,
  maxPrice,
  totalStock,
  className,
}: ProductFormSummaryProps) => {
  const categoryName =
    findCategoryById(categoryCatalog, categoryId)?.name ?? null

  const priceLabel =
    minPrice > 0 || maxPrice > 0
      ? minPrice === maxPrice
        ? formatVnd(minPrice)
        : `${formatVnd(minPrice)} – ${formatVnd(maxPrice)}`
      : "Chưa nhập giá"

  return (
    <aside
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-20",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">Tóm tắt</p>
      <h2 className="mt-1 font-heading text-base font-semibold leading-snug tracking-tight">
        {name.trim() || "Sản phẩm mới"}
      </h2>

      {slug ? (
        <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
          /{slug}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={
            isActive
              ? "bg-[var(--admin-brand)]/15 text-[var(--admin-brand)] hover:bg-[var(--admin-brand)]/15"
              : undefined
          }
        >
          {isActive ? "Đang bán" : "Ẩn"}
        </Badge>
        {categoryName ? (
          <Badge variant="outline">{categoryName}</Badge>
        ) : null}
        {brand ? <Badge variant="outline">{brand}</Badge> : null}
      </div>

      {imgUrl ? (
        <img
          src={imgUrl}
          alt=""
          className="mt-4 aspect-square w-full max-w-[140px] rounded-lg border border-border object-cover"
        />
      ) : (
        <div className="mt-4 flex aspect-square w-full max-w-[140px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
          Chưa có ảnh
        </div>
      )}

      <Separator className="my-4" />

      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Trục biến thể</dt>
          <dd className="font-medium">{optionAxes.length}</dd>
        </div>
        {optionAxes.length > 0 ? (
          <dd className="-mt-1 flex flex-wrap gap-1">
            {optionAxes.map((axis) => (
              <Badge key={axis} variant="secondary" className="font-normal">
                {getCatalogLabel(optionCatalog, axis)}
              </Badge>
            ))}
          </dd>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Số SKU</dt>
          <dd className="font-medium">{skuCount}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Giá</dt>
          <dd className="text-right font-medium">{priceLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Tồn kho</dt>
          <dd className="font-medium">{totalStock.toLocaleString("vi-VN")}</dd>
        </div>
      </dl>
    </aside>
  )
}
