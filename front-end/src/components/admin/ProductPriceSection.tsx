import type { Control } from "react-hook-form"
import { ChevronDown } from "lucide-react"
import { AdminFormCard } from "~/components/admin/AdminFormCard"
import { Input } from "~/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form"
import type { ProductFormValues } from "~/lib/admin/productFormSchema"
import { adminFormFieldLabelClass } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"

type ProductPriceSectionProps = {
  control: Control<ProductFormValues>
  hidden?: boolean
}

const priceMetaTags = [
  "Compare-at",
  "Unit price",
  "Charge tax",
  "Cost per item",
] as const

/** Section nhập giá/tồn kho cho sản phẩm đơn giản (chưa có variant). */
export const ProductPriceSection = ({
  control,
  hidden = false,
}: ProductPriceSectionProps) => {
  if (hidden) return null

  return (
    <AdminFormCard title="Price">
      <FormField
        control={control}
        name="basePrice"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  ₫
                </span>
                <Input
                  type="number"
                  min={0}
                  step={1000}
                  className="h-11 border-border/80 pl-8 text-[13px] tabular-nums shadow-none"
                  value={field.value || ""}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 0)
                  }
                  placeholder="0"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="mt-4 border-t border-border/60 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {priceMetaTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </div>
      </div>

      <FormField
        control={control}
        name="baseStock"
        render={({ field }) => (
          <FormItem className="mt-4">
            <span className={cn(adminFormFieldLabelClass, "mb-2 block")}>
              Available
            </span>
            <FormControl>
              <Input
                type="number"
                min={0}
                className="h-10 max-w-[12rem] border-border/80 text-[13px] tabular-nums shadow-none"
                value={field.value || ""}
                onChange={(event) =>
                  field.onChange(Number(event.target.value) || 0)
                }
                placeholder="0"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </AdminFormCard>
  )
}
