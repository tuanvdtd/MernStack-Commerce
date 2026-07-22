import type { Control } from "react-hook-form"
import { AdminFormCard } from "~/components/admin/AdminFormCard"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ADMIN_BRANDS } from "~/mock/adminCatalog"
import { findCategoryById } from "~/lib/admin/categoryCatalog"
import { formatVnd, adminFormFieldLabelClass } from "~/lib/admin/ui"
import type { ProductFormValues } from "~/lib/admin/productFormSchema"
import type { AdminCategory } from "~/types/admin/index"
import { cn } from "~/lib/utils"

type ProductFormSidebarProps = {
  control: Control<ProductFormValues>
  name: string
  slug: string
  categoryId: string
  categoryCatalog: AdminCategory[]
  isActive: boolean
  coverImageUrl: string
  skuCount: number
  minPrice: number
  maxPrice: number
  totalStock: number
  className?: string
}

const sidebarSelectClass =
  "h-9 w-full border-border/80 bg-background text-[13px] shadow-none"

/** Right sidebar: status, organization, preview — Shopify product editor pattern. */
export const ProductFormSidebar = ({
  control,
  name,
  slug,
  categoryId,
  categoryCatalog,
  isActive,
  coverImageUrl,
  skuCount,
  minPrice,
  maxPrice,
  totalStock,
  className,
}: ProductFormSidebarProps) => {
  const categoryName =
    findCategoryById(categoryCatalog, categoryId)?.name ?? null

  const priceLabel =
    minPrice > 0 || maxPrice > 0
      ? minPrice === maxPrice
        ? formatVnd(minPrice)
        : `${formatVnd(minPrice)} – ${formatVnd(maxPrice)}`
      : "—"

  return (
    <aside className={cn("space-y-3 sm:space-y-4 lg:sticky lg:top-[4.5rem] lg:self-start", className)}>
      <AdminFormCard title="Status">
        <FormField
          control={control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Status</FormLabel>
              <Select
                value={field.value ? "active" : "draft"}
                onValueChange={(value) => field.onChange(value === "active")}
              >
                <FormControl>
                  <SelectTrigger className={sidebarSelectClass}>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Hidden</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                {field.value
                  ? "Product is visible on the storefront."
                  : "Product is hidden from the storefront."}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </AdminFormCard>

      <AdminFormCard title="Product organization">
        <div className="space-y-4">
          <FormField
            control={control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={adminFormFieldLabelClass}>
                  Brand
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={sidebarSelectClass}>
                      <SelectValue placeholder="Choose brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ADMIN_BRANDS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {categoryName ? (
            <div className="space-y-1.5">
              <p className={adminFormFieldLabelClass}>Category</p>
              <p className="text-[13px] text-foreground">{categoryName}</p>
            </div>
          ) : null}
        </div>
      </AdminFormCard>

      <AdminFormCard title="Summary">
        <div className="space-y-3">
          <div>
            <p className="text-[13px] font-semibold leading-snug text-foreground">
              {name.trim() || "New product"}
            </p>
            {slug ? (
              <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                /{slug}
              </p>
            ) : null}
          </div>

          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt=""
              className="aspect-square w-full max-w-[120px] rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="flex aspect-square w-full max-w-[120px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-[11px] text-muted-foreground">
              No image
            </div>
          )}

          <dl className="space-y-2 border-t border-border/60 pt-3 text-[13px]">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{isActive ? "Active" : "Hidden"}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Variants</dt>
              <dd className="font-medium">{skuCount}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Price</dt>
              <dd className="text-right font-medium">{priceLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Inventory</dt>
              <dd className="font-medium">{totalStock.toLocaleString("en-US")}</dd>
            </div>
          </dl>
        </div>
      </AdminFormCard>
    </aside>
  )
}
