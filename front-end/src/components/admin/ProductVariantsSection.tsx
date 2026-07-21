import { Plus, Trash2, ImagePlus } from "lucide-react"
import type { Control, FieldArrayWithId } from "react-hook-form"
import { useFormContext, useWatch } from "react-hook-form"
import { AdminFormCard } from "~/components/admin/AdminFormCard"
import { CatalogCreatablePicker } from "~/components/admin/CatalogCreatablePicker"
import { SpuOptionAxesEditor } from "~/components/admin/SpuOptionAxesEditor"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form"
import {
  addCatalogValue,
  getCatalogLabel,
  getCatalogValues,
  type OptionCatalogEntry,
} from "~/lib/admin/optionCatalog"
import type { ProductFormValues } from "~/lib/admin/productFormSchema"
import { adminThClass, adminTdClass } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"
import { toast } from "sonner"
import {
  ImageUploadField,
  type ImageUploadChangeMeta,
} from "~/components/admin/ImageUploadField"

type ProductVariantsSectionProps = {
  control: Control<ProductFormValues>
  fields: FieldArrayWithId<ProductFormValues, "variants", "id">[]
  optionAxes: string[]
  optionCatalog: OptionCatalogEntry[]
  onOptionAxesChange: (axes: string[]) => void
  onCatalogChange: (catalog: OptionCatalogEntry[]) => void
  optionAxesError?: string | null
  variantsError?: string | null
  onAddVariant: () => void
  onRemoveVariant: (index: number) => void
  onSkuImageChange: (index: number, meta?: ImageUploadChangeMeta) => void
}

/** Build a display label from option values, e.g. "Purple / 256GB". */
const getVariantLabel = (
  variant: ProductFormValues["variants"][number] | undefined,
  optionAxes: string[],
  optionCatalog: OptionCatalogEntry[]
) => {
  if (!variant) return "New variant"
  const parts = optionAxes.map((axis) => {
    const value =
      variant.options.find((option) => option.optionName === axis)?.value ?? ""
    return value || getCatalogLabel(optionCatalog, axis)
  })
  return parts.filter(Boolean).join(" / ") || "New variant"
}

type VariantTableRowProps = {
  control: Control<ProductFormValues>
  index: number
  optionAxes: string[]
  optionCatalog: OptionCatalogEntry[]
  onCatalogChange: (catalog: OptionCatalogEntry[]) => void
  canRemove: boolean
  onRemove: () => void
  onSkuImageChange: (index: number, meta?: ImageUploadChangeMeta) => void
}

const VariantTableRow = ({
  control,
  index,
  optionAxes,
  optionCatalog,
  onCatalogChange,
  canRemove,
  onRemove,
  onSkuImageChange,
}: VariantTableRowProps) => {
  const { setValue } = useFormContext<ProductFormValues>()
  const row = useWatch({ control, name: `variants.${index}` })
  const variantLabel = getVariantLabel(row, optionAxes, optionCatalog)

  const handleCreateValue = (optionName: string, rawValue: string) => {
    const result = addCatalogValue(optionCatalog, optionName, rawValue)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    onCatalogChange(result.catalog)
  }

  return (
    <>
      <tr className="border-b border-border/60 last:border-0">
        <td className={cn(adminTdClass, "min-w-[12rem]")}>
          <div className="flex items-start gap-3">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30">
              {row?.imgUrl ? (
                <img
                  src={row.imgUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ImagePlus className="size-4" aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-[13px] font-medium leading-snug text-foreground">
                {variantLabel}
              </p>
              {row?.id ? (
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {row.id}
                </p>
              ) : null}
            </div>
          </div>
        </td>
        <td className={cn(adminTdClass, "min-w-[8rem]")}>
          <FormField
            control={control}
            name={`variants.${index}.price`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-muted-foreground">
                      ₫
                    </span>
                    <Input
                      type="number"
                      min={0}
                      className="h-9 pl-7 text-[13px] tabular-nums"
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
        </td>
        <td className={cn(adminTdClass, "min-w-[6rem]")}>
          <FormField
            control={control}
            name={`variants.${index}.stockQuantity`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    className="h-9 text-[13px] tabular-nums"
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
        </td>
        <td className={cn(adminTdClass, "w-10")}>
          {canRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
              aria-label={`Remove variant ${index + 1}`}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </td>
      </tr>
      <tr className="border-b border-border/40 bg-muted/10 last:border-0">
        <td colSpan={4} className="px-4 py-3 sm:px-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {optionAxes.map((axisName, axisIndex) => {
              const presetValues = getCatalogValues(optionCatalog, axisName)
              const currentValue =
                row?.options?.find((option) => option.optionName === axisName)
                  ?.value ?? ""
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
                      <FormControl>
                        <CatalogCreatablePicker
                          value={field.value ?? ""}
                          onChange={(value) => {
                            field.onChange(value)
                            setValue(
                              `variants.${index}.options.${axisIndex}.optionName`,
                              axisName,
                              { shouldValidate: false }
                            )
                          }}
                          options={valueOptions}
                          placeholder={label}
                          createPlaceholder="New value..."
                          createButtonLabel="Add"
                          onCreate={(raw) => handleCreateValue(axisName, raw)}
                          triggerClassName="h-9 w-full text-[13px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            })}

            <FormField
              control={control}
              name={`variants.${index}.imgUrl`}
              render={({ field }) => (
                <FormItem className="sm:col-span-2 lg:col-span-4">
                  <FormControl>
                    <ImageUploadField
                      label="Variant image"
                      value={field.value ?? ""}
                      onChange={(newValue, meta) => {
                        onSkuImageChange(index, meta)
                        field.onChange(newValue)
                      }}
                      onError={(message) => toast.error(message)}
                      className="[&_label]:text-xs [&_label]:font-medium [&_label]:text-muted-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </td>
      </tr>
    </>
  )
}

/** Variants block: option axes + Shopify-style table. */
export const ProductVariantsSection = ({
  control,
  fields,
  optionAxes,
  optionCatalog,
  onOptionAxesChange,
  onCatalogChange,
  optionAxesError,
  variantsError,
  onAddVariant,
  onRemoveVariant,
  onSkuImageChange,
}: ProductVariantsSectionProps) => {
  const variants = useWatch({ control, name: "variants" })
  const totalStock =
    variants?.reduce((sum, variant) => sum + (variant.stockQuantity || 0), 0) ??
    0

  return (
    <AdminFormCard
      title="Variants"
      action={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-[13px] text-[var(--admin-brand)] hover:text-[var(--admin-brand)]"
          onClick={onAddVariant}
        >
          <Plus className="size-4" aria-hidden />
          Add variant
        </Button>
      }
    >
      <SpuOptionAxesEditor
        axes={optionAxes}
        onChange={onOptionAxesChange}
        optionCatalog={optionCatalog}
        onCatalogChange={onCatalogChange}
        error={optionAxesError}
      />

      {variantsError ? (
        <p
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          role="alert"
        >
          {variantsError}
        </p>
      ) : null}

      <div className="-mx-4 mt-5 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[32rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border/80 bg-muted/20">
              <th className={adminThClass}>Variant</th>
              <th className={adminThClass}>Price</th>
              <th className={adminThClass}>Available</th>
              <th className={cn(adminThClass, "w-10")} aria-hidden />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <VariantTableRow
                key={field.id}
                control={control}
                index={index}
                optionAxes={optionAxes}
                optionCatalog={optionCatalog}
                onCatalogChange={onCatalogChange}
                canRemove={fields.length > 1}
                onRemove={() => onRemoveVariant(index)}
                onSkuImageChange={onSkuImageChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        Total inventory across all variants:{" "}
        <span className="font-medium text-foreground">
          {totalStock.toLocaleString("en-US")} available
        </span>
      </p>
    </AdminFormCard>
  )
}
