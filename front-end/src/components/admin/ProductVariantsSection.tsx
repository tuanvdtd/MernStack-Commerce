import { Fragment, useMemo, useState } from "react"
import { CirclePlus, ImagePlus, Plus } from "lucide-react"
import type { Control, FieldArrayWithId } from "react-hook-form"
import { useFormContext, useWatch } from "react-hook-form"
import { AdminFormCard } from "~/components/admin/AdminFormCard"
import { CatalogCreatablePicker } from "~/components/admin/CatalogCreatablePicker"
import { ProductOptionEditor } from "~/components/admin/ProductOptionEditor"
import { Input } from "~/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form"
import {
  addCatalogOption,
  getCatalogLabel,
  type OptionCatalogEntry,
} from "~/lib/admin/optionCatalog"
import type {
  ProductFormValues,
  ProductOptionDefinitionFormValues,
} from "~/lib/admin/productFormSchema"
import {
  buildVariantComboKey,
  generateVariantsFromOptionDefinitions,
  hasVariantOptions,
} from "~/lib/admin/variantGeneration"
import { adminThClass, adminTdClass } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"
import { toast } from "sonner"

type ProductVariantsSectionProps = {
  control: Control<ProductFormValues>
  fields: FieldArrayWithId<ProductFormValues, "variants", "id">[]
  optionCatalog: OptionCatalogEntry[]
  onCatalogChange: (catalog: OptionCatalogEntry[]) => void
  optionDefinitions: ProductOptionDefinitionFormValues[]
  onOptionDefinitionsChange: (
    definitions: ProductOptionDefinitionFormValues[]
  ) => void
  onVariantsReplace: (variants: ProductFormValues["variants"]) => void
  variantsError?: string | null
  optionDefinitionsError?: string | null
}

type VariantRowProps = {
  control: Control<ProductFormValues>
  index: number
  label: string
  nested?: boolean
}

/** Một dòng SKU trong bảng variant (giá + tồn kho). */
const VariantRow = ({
  control,
  index,
  label,
  nested = false,
}: VariantRowProps) => {
  const row = useWatch({ control, name: `variants.${index}` })

  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className={cn(adminTdClass, nested && "pl-10")}>
        <div className="flex items-center gap-3">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30">
            {row?.imgUrl ? (
              <img src={row.imgUrl} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <ImagePlus className="size-4" aria-hidden />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium leading-snug">{label}</p>
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
    </tr>
  )
}

/** Section variant theo flow Shopify: thêm option → chọn giá trị → sinh bảng SKU. */
export const ProductVariantsSection = ({
  control,
  fields,
  optionCatalog,
  onCatalogChange,
  optionDefinitions,
  onOptionDefinitionsChange,
  onVariantsReplace,
  variantsError,
  optionDefinitionsError,
}: ProductVariantsSectionProps) => {
  const { getValues } = useFormContext<ProductFormValues>()
  const variants = useWatch({ control, name: "variants" })
  const [editingOptionName, setEditingOptionName] = useState<string | null>(null)

  const hasOptions = hasVariantOptions(optionDefinitions)
  const optionAxes = optionDefinitions.map((definition) => definition.name)
  const groupAxis = optionAxes[0]
  const usedOptionNames = optionDefinitions.map((definition) => definition.name)
  const availableOptionNames = optionCatalog
    .map((entry) => entry.name)
    .filter((name) => !usedOptionNames.includes(name))

  const formatOptionName = (name: string) => {
    const label = getCatalogLabel(optionCatalog, name)
    return label === name ? name : `${label} (${name})`
  }

  /** Tạo option axis mới trong catalog. */
  const handleCreateOptionAxis = (rawName: string): string | null => {
    const result = addCatalogOption(optionCatalog, rawName)
    if ("error" in result) {
      toast.error(result.error)
      return null
    }
    onCatalogChange(result.catalog)
    return result.name
  }

  /** Mở editor sau khi chọn option từ menu catalog. */
  const handleSelectOption = (optionName: string) => {
    if (!optionName.trim()) return
    setEditingOptionName(optionName)
  }

  const totalStock =
    variants?.reduce((sum, variant) => sum + (variant.stockQuantity || 0), 0) ??
    0

  const groupedRows = useMemo(() => {
    if (!hasOptions || !groupAxis) return []

    const groups = new Map<
      string,
      Array<{ index: number; label: string; comboKey: string }>
    >()

    fields.forEach((_field, index) => {
      const variant = variants?.[index]
      if (!variant) return

      const groupValue =
        variant.options.find((option) => option.optionName === groupAxis)
          ?.value ?? "Variant"

      const secondaryLabel = optionAxes
        .slice(1)
        .map((axis) => {
          const value =
            variant.options.find((option) => option.optionName === axis)?.value ??
            ""
          return value
        })
        .filter(Boolean)
        .join(" / ")

      const list = groups.get(groupValue) ?? []
      list.push({
        index,
        label: secondaryLabel || groupValue,
        comboKey: buildVariantComboKey(optionAxes, variant.options),
      })
      groups.set(groupValue, list)
    })

    return [...groups.entries()].map(([groupValue, rows]) => ({
      groupValue,
      rows,
    }))
  }, [fields, variants, hasOptions, groupAxis, optionAxes])

  const optionAxisPickerProps = {
    value: "",
    onChange: handleSelectOption,
    options: availableOptionNames,
    formatOption: formatOptionName,
    createPlaceholder: "New axis name (e.g. Material)",
    createButtonLabel: "Add axis",
    onCreate: (raw: string) => {
      const name = handleCreateOptionAxis(raw)
      if (name) handleSelectOption(name)
    },
    showChevron: false,
  } as const

  /** Sinh lại SKU sau khi cập nhật optionDefinitions. */
  const syncVariants = (
    definitions: ProductOptionDefinitionFormValues[],
    fallbackPrice?: number,
    fallbackStock?: number
  ) => {
    const currentVariants = getValues("variants")
    const basePrice = fallbackPrice ?? getValues("basePrice") ?? 0
    const baseStock = fallbackStock ?? getValues("baseStock") ?? 0

    if (!hasVariantOptions(definitions)) {
      onVariantsReplace([
        {
          id: currentVariants[0]?.id,
          price: basePrice,
          stockQuantity: baseStock,
          imgUrl: currentVariants[0]?.imgUrl ?? "",
          options: [],
        },
      ])
      return
    }

    onVariantsReplace(
      generateVariantsFromOptionDefinitions(definitions, currentVariants, {
        price: basePrice,
        stockQuantity: baseStock,
      })
    )
  }

  /** Lưu option sau khi admin ấn Done. */
  const handleOptionDone = (definition: ProductOptionDefinitionFormValues) => {
    const nextDefinitions = editingOptionName
      ? optionDefinitions.some((item) => item.name === editingOptionName)
        ? optionDefinitions.map((item) =>
            item.name === editingOptionName ? definition : item
          )
        : [...optionDefinitions, definition]
      : [...optionDefinitions, definition]

    onOptionDefinitionsChange(nextDefinitions)
    syncVariants(nextDefinitions)
    setEditingOptionName(null)
  }

  /** Xóa option đang edit hoặc đã lưu. */
  const handleOptionDelete = () => {
    if (!editingOptionName) return

    const nextDefinitions = optionDefinitions.filter(
      (definition) => definition.name !== editingOptionName
    )
    onOptionDefinitionsChange(nextDefinitions)
    syncVariants(nextDefinitions)
    setEditingOptionName(null)
  }

  /** Mở lại editor để sửa values của option đã lưu. */
  const handleEditSavedOption = (optionName: string) => {
    setEditingOptionName(optionName)
  }

  const editingDefinition = editingOptionName
    ? optionDefinitions.find((definition) => definition.name === editingOptionName)
    : undefined

  const isEditingNewOption =
    Boolean(editingOptionName) &&
    !optionDefinitions.some((definition) => definition.name === editingOptionName)

  return (
    <AdminFormCard title="Variants">
      <div className="space-y-3">
        {optionDefinitions.map((definition) =>
          editingOptionName === definition.name ? (
            <ProductOptionEditor
              key={definition.name}
              optionName={editingOptionName}
              initialValues={editingDefinition?.values ?? definition.values}
              optionCatalog={optionCatalog}
              onCatalogChange={onCatalogChange}
              onDone={handleOptionDone}
              onDelete={handleOptionDelete}
            />
          ) : (
            <button
              key={definition.name}
              type="button"
              className="w-full rounded-xl border border-border/70 p-3 text-left hover:border-[var(--admin-brand)]/30"
              onClick={() => handleEditSavedOption(definition.name)}
            >
              <div className="flex items-start gap-2">
                <GripPlaceholder />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground">
                    {getCatalogLabel(optionCatalog, definition.name)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {definition.values.map((value) => (
                      <span
                        key={value}
                        className="rounded-full border border-border/70 bg-muted/20 px-2.5 py-1 text-[12px]"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          )
        )}

        {isEditingNewOption && editingOptionName ? (
          <ProductOptionEditor
            key={`new-${editingOptionName}`}
            optionName={editingOptionName}
            initialValues={[]}
            optionCatalog={optionCatalog}
            onCatalogChange={onCatalogChange}
            onDone={handleOptionDone}
            onDelete={handleOptionDelete}
          />
        ) : null}

        {!editingOptionName ? (
          hasOptions ? (
            <CatalogCreatablePicker
              {...optionAxisPickerProps}
              placeholder="Add another option"
              leadingIcon={<Plus className="size-4" aria-hidden />}
              triggerClassName="h-auto w-fit justify-start gap-2 border-0 bg-transparent px-1 py-1 text-[13px] font-normal text-[var(--admin-brand)] shadow-none hover:bg-transparent hover:text-[var(--admin-brand)]"
            />
          ) : (
            <CatalogCreatablePicker
              {...optionAxisPickerProps}
              placeholder="Add options like size or color"
              leadingIcon={<CirclePlus className="size-4" aria-hidden />}
              triggerClassName="h-auto w-full justify-start gap-2 border-0 bg-transparent px-1 py-2 text-[13px] font-normal text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground"
            />
          )
        ) : null}
      </div>

        {optionDefinitionsError ? (
          <p
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
            role="alert"
          >
            {optionDefinitionsError}
          </p>
        ) : null}

        {variantsError ? (
          <p
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
            role="alert"
          >
            {variantsError}
          </p>
        ) : null}

        {hasOptions && fields.length > 0 && !editingOptionName ? (
          <div className="-mx-4 mt-5 overflow-x-auto sm:mx-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-0">
              <p className="text-[12px] text-muted-foreground">
                Group by{" "}
                <span className="font-medium text-foreground">
                  {getCatalogLabel(optionCatalog, groupAxis)}
                </span>
              </p>
            </div>

            <table className="w-full min-w-[32rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-border/80 bg-muted/20">
                  <th className={adminThClass}>Variant</th>
                  <th className={adminThClass}>Price</th>
                  <th className={adminThClass}>Available</th>
                </tr>
              </thead>
              <tbody>
                {optionAxes.length === 1
                  ? fields.map((field, index) => {
                      const variant = variants?.[index]
                      const label =
                        variant?.options.find(
                          (option) => option.optionName === groupAxis
                        )?.value ?? `Variant ${index + 1}`

                      return (
                        <VariantRow
                          key={field.id}
                          control={control}
                          index={index}
                          label={label}
                        />
                      )
                    })
                  : groupedRows.map((group) => (
                      <Fragment key={`group-${group.groupValue}`}>
                        <tr className="border-b border-border/60 bg-muted/10">
                          <td colSpan={3} className={adminTdClass}>
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium">
                                {group.groupValue}
                              </span>
                              <span className="text-[12px] text-muted-foreground">
                                {group.rows.length} variants
                              </span>
                            </div>
                          </td>
                        </tr>
                        {group.rows.map((row) => (
                          <VariantRow
                            key={row.comboKey}
                            control={control}
                            index={row.index}
                            label={row.label}
                            nested
                          />
                        ))}
                      </Fragment>
                    ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {hasOptions ? (
          <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            Total inventory across all variants:{" "}
            <span className="font-medium text-foreground">
              {totalStock.toLocaleString("en-US")} available
            </span>
          </p>
        ) : null}
    </AdminFormCard>
  )
}

/** Icon grip placeholder giống Shopify editor. */
const GripPlaceholder = () => (
  <span className="mt-1 inline-flex flex-col gap-0.5" aria-hidden>
    <span className="block size-1 rounded-full bg-muted-foreground/50" />
    <span className="block size-1 rounded-full bg-muted-foreground/50" />
    <span className="block size-1 rounded-full bg-muted-foreground/50" />
  </span>
)
