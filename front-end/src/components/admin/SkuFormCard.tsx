import { Trash2 } from "lucide-react"
import type { Control } from "react-hook-form"
import { useFormContext, useWatch } from "react-hook-form"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import {
  ImageUploadField,
  type ImageUploadChangeMeta,
} from "~/components/admin/ImageUploadField"
import { CatalogCreatablePicker } from "~/components/admin/CatalogCreatablePicker"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { toast } from "sonner"
import {
  addCatalogValue,
  getCatalogLabel,
  getCatalogValues,
  type OptionCatalogEntry,
} from "~/lib/admin/optionCatalog"
import type { ProductFormValues } from "~/lib/admin/productFormSchema"
import { formatVnd } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"

type SkuFormCardProps = {
  control: Control<ProductFormValues>
  index: number
  optionAxes: string[]
  optionCatalog: OptionCatalogEntry[]
  onCatalogChange: (catalog: OptionCatalogEntry[]) => void
  canRemove: boolean
  onRemove: () => void
  onImageFieldChange?: (meta?: ImageUploadChangeMeta) => void | Promise<void>
  compact?: boolean
}

export const SkuFormCard = ({
  control,
  index,
  optionAxes,
  optionCatalog,
  onCatalogChange,
  canRemove,
  onRemove,
  onImageFieldChange,
  compact = false,
}: SkuFormCardProps) => {
  const { setValue } = useFormContext<ProductFormValues>()
  const row = useWatch({ control, name: `variants.${index}` })
  const filledOptions =
    row?.options?.filter((o) => o.optionName && o.value) ?? []

  const handleCreateValue = (optionName: string, rawValue: string) => {
    const result = addCatalogValue(optionCatalog, optionName, rawValue)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    onCatalogChange(result.catalog)
  }

  const variantSummary =
    filledOptions.length > 0
      ? filledOptions
          .map(
            (o) => getCatalogLabel(optionCatalog, o.optionName) + ": " + o.value
          )
          .join(" · ")
      : "No variant selected"

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-card",
        compact
          ? "rounded-none border-0"
          : "rounded-xl border border-border shadow-sm"
      )}
    >
      {!compact ? (
        <div
          className="absolute inset-y-0 left-0 w-1 bg-[var(--admin-brand)]"
          aria-hidden
        />
      ) : null}

      <div
        className={cn("space-y-5 p-4 sm:p-5", compact ? "" : "pl-5 sm:pl-6")}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-heading text-sm font-semibold text-foreground">
                Variant #{index + 1}
              </h4>
              {row?.id ? (
                <Badge variant="outline" className="font-mono font-normal">
                  {row.id}
                </Badge>
              ) : null}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {variantSummary}
            </p>
            {row && row.price > 0 ? (
              <p className="text-xs font-medium text-foreground">
                {formatVnd(row.price)}
                {row.stockQuantity > 0
                  ? ` - Stock ${row.stockQuantity.toLocaleString("en-US")}`
                  : null}
              </p>
            ) : null}
          </div>
          {canRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="shrink-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden />
              Remove
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {optionAxes.map((axisName, axisIndex) => {
            const presetValues = getCatalogValues(optionCatalog, axisName)
            const currentValue =
              row?.options?.find((o) => o.optionName === axisName)?.value ?? ""
            const valueOptions = [
              ...new Set([
                ...presetValues,
                ...(currentValue ? [currentValue] : []),
              ]),
            ]
            const label = getCatalogLabel(optionCatalog, axisName)

            return (
              <FormField
                key={`${index}-${axisName}`}
                control={control}
                name={`variants.${index}.options.${axisIndex}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-muted-foreground">
                      {label} *
                    </FormLabel>
                    <FormControl>
                      <CatalogCreatablePicker
                        value={field.value ?? ""}
                        onChange={(val) => {
                          field.onChange(val)
                          setValue(
                            `variants.${index}.options.${axisIndex}.optionName`,
                            axisName,
                            { shouldValidate: false }
                          )
                        }}
                        options={valueOptions}
                        placeholder={`Choose ${label}`}
                        createPlaceholder="New value..."
                        createButtonLabel="Add"
                        onCreate={(raw) => handleCreateValue(axisName, raw)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name={`variants.${index}.price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">
                  Sale price (VND) *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                    placeholder="29990000"
                  />
                </FormControl>
                {field.value > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {formatVnd(field.value)}
                  </p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`variants.${index}.stockQuantity`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Stock *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                    placeholder="100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name={`variants.${index}.imgUrl`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUploadField
                  label="Variant image (optional)"
                  description="Use when this variant has a different image from the SPU"
                  value={field.value ?? ""}
                  onChange={(newValue, meta) => {
                    onImageFieldChange?.(meta)
                    field.onChange(newValue)
                  }}
                  onError={(msg) => toast.error(msg)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
