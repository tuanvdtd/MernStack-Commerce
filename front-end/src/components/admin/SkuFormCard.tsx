import { Wand2, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { ImageUploadField } from "~/components/admin/ImageUploadField"
import { CatalogCreatablePicker } from "~/components/admin/CatalogCreatablePicker"
import { toast } from "sonner"
import type { VariantOption } from "~/types/admin/index"
import {
  addCatalogValue,
  getCatalogLabel,
  getCatalogValues,
  type OptionCatalogEntry,
} from "~/lib/admin/optionCatalog"
import {
  alignSkuOptionsToAxes,
  suggestSkuCode,
} from "~/lib/admin/productUtils"

export interface SkuFormData {
  id?: string
  sku: string
  price: number
  stockQuantity: number
  imgUrl: string
  options: VariantOption[]
}

type SkuFormCardProps = {
  index: number
  data: SkuFormData
  optionAxes: string[]
  optionCatalog: OptionCatalogEntry[]
  onCatalogChange: (catalog: OptionCatalogEntry[]) => void
  productSlug: string
  canRemove: boolean
  onChange: (data: SkuFormData) => void
  onRemove: () => void
}

export const createDefaultSkuForm = (optionAxes: string[]): SkuFormData => ({
  sku: "",
  price: 0,
  stockQuantity: 0,
  imgUrl: "",
  options: alignSkuOptionsToAxes(optionAxes, []),
})

export const SkuFormCard = ({
  index,
  data,
  optionAxes,
  optionCatalog,
  onCatalogChange,
  productSlug,
  canRemove,
  onChange,
  onRemove,
}: SkuFormCardProps) => {
  const handleSuggestSku = () => {
    const filled = data.options.filter((o) => o.optionName && o.value)
    if (filled.length === 0) return
    onChange({ ...data, sku: suggestSkuCode(productSlug, filled) })
  }

  const handleValueChange = (optionName: string, value: string) => {
    const options = data.options.map((o) =>
      o.optionName === optionName ? { ...o, value } : o
    )
    onChange({ ...data, options })
  }

  const handleCreateValue = (optionName: string, rawValue: string) => {
    const result = addCatalogValue(optionCatalog, optionName, rawValue)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    onCatalogChange(result.catalog)
  }

  return (
    <div className="space-y-5 rounded-xl border border-border bg-muted/30 p-5">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-heading text-sm font-semibold text-foreground">
          SKU #{index + 1}
          <span className="ml-2 font-normal text-muted-foreground">
            ProductVariant
          </span>
        </h4>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label={`Xóa SKU ${index + 1}`}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`sku-code-${index}`}>Mã SKU *</Label>
          <div className="flex gap-2">
            <Input
              id={`sku-code-${index}`}
              value={data.sku}
              onChange={(e) => onChange({ ...data, sku: e.target.value.toUpperCase() })}
              placeholder="VD: IPHONE15-BLACK-256GB"
              className="font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={handleSuggestSku}
              title="Gợi ý mã từ slug SPU + giá trị thuộc tính"
              aria-label="Gợi ý mã SKU"
            >
              <Wand2 className="size-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Mã unique toàn hệ thống
          </p>
        </div>

        <ImageUploadField
          label="Ảnh SKU (tùy chọn)"
          description="Khác ảnh SPU nếu biến thể có hình riêng"
          value={data.imgUrl}
          onChange={(imgUrl) => onChange({ ...data, imgUrl })}
          onError={(msg) => toast.error(msg)}
          className="md:col-span-1"
        />
      </div>

      <div className="space-y-2">
        <Label>Giá trị biến thể *</Label>
        <p className="text-xs text-muted-foreground">
          Chọn giá trị có sẵn hoặc thêm OptionValue mới cho từng trục
        </p>
        <div className="space-y-2">
          {optionAxes.map((axisName) => {
            const current = data.options.find((o) => o.optionName === axisName)
            const presetValues = getCatalogValues(optionCatalog, axisName)
            const valueOptions = [
              ...new Set([
                ...presetValues,
                ...(current?.value ? [current.value] : []),
              ]),
            ]

            return (
              <div key={axisName} className="flex items-center gap-2">
                <span className="w-[140px] shrink-0 text-sm text-muted-foreground">
                  {getCatalogLabel(optionCatalog, axisName)}
                </span>
                <CatalogCreatablePicker
                  className="flex-1"
                  value={current?.value ?? ""}
                  onChange={(val) => handleValueChange(axisName, val)}
                  options={valueOptions}
                  placeholder={`Chọn ${getCatalogLabel(optionCatalog, axisName)}`}
                  createPlaceholder="Giá trị mới…"
                  createButtonLabel="Thêm"
                  onCreate={(raw) => handleCreateValue(axisName, raw)}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`sku-price-${index}`}>Giá bán (đ) *</Label>
          <Input
            id={`sku-price-${index}`}
            type="number"
            min={0}
            value={data.price || ""}
            onChange={(e) =>
              onChange({ ...data, price: Number(e.target.value) || 0 })
            }
            placeholder="29990000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`sku-stock-${index}`}>Tồn kho *</Label>
          <Input
            id={`sku-stock-${index}`}
            type="number"
            min={0}
            value={data.stockQuantity || ""}
            onChange={(e) =>
              onChange({
                ...data,
                stockQuantity: Number(e.target.value) || 0,
              })
            }
            placeholder="100"
          />
        </div>
      </div>
    </div>
  )
}
