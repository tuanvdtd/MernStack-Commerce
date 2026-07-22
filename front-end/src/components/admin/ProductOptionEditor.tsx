import { useMemo, useState } from "react"
import { Database, GripVertical, X } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import { OptionValueMultiPicker } from "~/components/admin/OptionValueMultiPicker"
import {
  addCatalogValue,
  getCatalogLabel,
  getCatalogValues,
  type OptionCatalogEntry,
} from "~/lib/admin/optionCatalog"
import type { ProductOptionDefinitionFormValues } from "~/lib/admin/productFormSchema"
import { adminFormFieldLabelClass } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"
import { toast } from "sonner"

type ProductOptionEditorProps = {
  optionName: string
  initialValues: string[]
  optionCatalog: OptionCatalogEntry[]
  onCatalogChange: (catalog: OptionCatalogEntry[]) => void
  onDone: (definition: ProductOptionDefinitionFormValues) => void
  onDelete: () => void
}

type OptionValueChipProps = {
  value: string
  onRemove: () => void
}

/** Chip giá trị option đã chọn trong editor. */
const OptionValueChip = ({ value, onRemove }: OptionValueChipProps) => (
  <span className="inline-flex items-center gap-1.5 rounded-md border border-[#b4cce8] bg-[#e8f0fb] px-2 py-1 text-[13px] text-foreground">
    <span>{value}</span>
    <button
      type="button"
      className="rounded-sm p-0.5 text-[#2c6ecb] hover:bg-[#2c6ecb]/10"
      aria-label={`Remove ${value}`}
      onClick={onRemove}
    >
      <X className="size-3.5" strokeWidth={2.5} />
    </button>
  </span>
)

/** Form inline cấu hình tên option và danh sách giá trị trước khi sinh SKU. */
export const ProductOptionEditor = ({
  optionName,
  initialValues,
  optionCatalog,
  onCatalogChange,
  onDone,
  onDelete,
}: ProductOptionEditorProps) => {
  const [values, setValues] = useState<string[]>(initialValues)

  const presetValues = useMemo(
    () => getCatalogValues(optionCatalog, optionName),
    [optionCatalog, optionName]
  )

  const label = getCatalogLabel(optionCatalog, optionName)
  const addValueLabel = `Add ${label.toLowerCase()}`

  /** Thêm giá trị mới vào catalog khi admin tạo custom value. */
  const handleCreateValue = (rawValue: string): boolean => {
    const trimmed = rawValue.trim()
    if (!trimmed) return false

    const result = addCatalogValue(optionCatalog, optionName, trimmed)
    if ("error" in result) {
      toast.error(result.error)
      return false
    }

    onCatalogChange(result.catalog)
    return true
  }

  /** Xóa một giá trị khỏi danh sách đang chọn. */
  const removeValue = (value: string) => {
    setValues((prev) => prev.filter((item) => item !== value))
  }

  /** Hoàn tất cấu hình option và trả definition cho parent. */
  const handleDone = () => {
    if (values.length === 0) {
      toast.error("Add at least one value for this option")
      return
    }

    onDone({
      name: optionName,
      values,
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-background">
      <div className="flex gap-3 p-4">
        <div className="flex w-4 shrink-0 items-center self-stretch">
          <GripVertical
            className="size-4 text-muted-foreground/70"
            aria-hidden
          />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className={adminFormFieldLabelClass}>Option name</span>
            <Badge
              variant="secondary"
              className="gap-1 rounded-md border border-[#b4cce8] bg-[#e8f0fb] px-2 py-0.5 text-[11px] font-medium text-[#005bd3]"
            >
              <Database className="size-3" aria-hidden />
              {label}
            </Badge>
          </div>

          <Input
            value={optionName}
            readOnly
            className="h-10 border-border/80 text-[13px] shadow-none"
          />

          <div className="min-h-[5.75rem] rounded-lg border border-border/80 px-2.5 py-2">
            {values.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {values.map((value) => (
                  <OptionValueChip
                    key={value}
                    value={value}
                    onRemove={() => removeValue(value)}
                  />
                ))}
              </div>
            ) : null}

            <OptionValueMultiPicker
              selectedValues={values}
              onSelectedValuesChange={setValues}
              options={presetValues}
              placeholder={addValueLabel}
              createPlaceholder={`New ${label.toLowerCase()} value`}
              createButtonLabel="Add"
              onCreate={handleCreateValue}
              className={cn(values.length > 0 && "mt-2")}
              triggerClassName={cn(
                "h-8 w-full justify-start border-0 bg-transparent px-0.5 text-[13px] font-normal shadow-none",
                "text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          className="h-9 min-w-[5.5rem] border-border/80 bg-background text-[13px] font-medium text-[#8e1f0b] shadow-none hover:bg-muted/30 hover:text-[#8e1f0b]"
          onClick={onDelete}
        >
          Delete
        </Button>
        <Button
          type="button"
          className="h-9 min-w-[5.5rem] rounded-lg bg-[#303030] px-5 text-[13px] font-medium text-white shadow-none hover:bg-[#303030]/90"
          onClick={handleDone}
          disabled={values.length === 0}
        >
          Done
        </Button>
      </div>
    </div>
  )
}
