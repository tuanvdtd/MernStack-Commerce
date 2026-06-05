import { Wand2, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Badge } from "~/components/ui/badge"
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
import { formatVnd } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"

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
  compact?: boolean
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
  compact = false,
}: SkuFormCardProps) => {
  const filledOptions = data.options.filter((o) => o.optionName && o.value)

  const handleSuggestSku = () => {
    if (filledOptions.length === 0) return
    onChange({ ...data, sku: suggestSkuCode(productSlug, filledOptions) })
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

  const variantSummary =
    filledOptions.length > 0
      ? filledOptions
          .map((o) => getCatalogLabel(optionCatalog, o.optionName) + ": " + o.value)
          .join(" · ")
      : "Chưa chọn biến thể"

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
        className={cn(
          "space-y-5 p-4 sm:p-5",
          compact ? "" : "pl-5 sm:pl-6"
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-heading text-sm font-semibold text-foreground">
                SKU #{index + 1}
              </h4>
              {data.sku ? (
                <Badge variant="outline" className="font-mono font-normal">
                  {data.sku}
                </Badge>
              ) : null}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {variantSummary}
            </p>
            {data.price > 0 ? (
              <p className="text-xs font-medium text-foreground">
                {formatVnd(data.price)}
                {data.stockQuantity > 0
                  ? ` · Tồn ${data.stockQuantity.toLocaleString("vi-VN")}`
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
              Xóa
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {optionAxes.map((axisName) => {
            const current = data.options.find((o) => o.optionName === axisName)
            const presetValues = getCatalogValues(optionCatalog, axisName)
            const valueOptions = [
              ...new Set([
                ...presetValues,
                ...(current?.value ? [current.value] : []),
              ]),
            ]
            const label = getCatalogLabel(optionCatalog, axisName)

            return (
              <div key={axisName} className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {label} *
                </Label>
                <CatalogCreatablePicker
                  value={current?.value ?? ""}
                  onChange={(val) => handleValueChange(axisName, val)}
                  options={valueOptions}
                  placeholder={`Chọn ${label}`}
                  createPlaceholder="Giá trị mới…"
                  createButtonLabel="Thêm"
                  onCreate={(raw) => handleCreateValue(axisName, raw)}
                />
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1">
            <Label htmlFor={`sku-code-${index}`} className="text-xs font-medium">
              Mã SKU *
            </Label>
            <div className="flex gap-2">
              <Input
                id={`sku-code-${index}`}
                value={data.sku}
                onChange={(e) =>
                  onChange({ ...data, sku: e.target.value.toUpperCase() })
                }
                placeholder="IPHONE15-BLACK-256GB"
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleSuggestSku}
                title="Gợi ý mã từ slug SPU và giá trị thuộc tính"
                aria-label="Gợi ý mã SKU"
                className="shrink-0"
              >
                <Wand2 className="size-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Mã unique toàn hệ thống</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`sku-price-${index}`} className="text-xs font-medium">
              Giá bán (đ) *
            </Label>
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
            {data.price > 0 ? (
              <p className="text-xs text-muted-foreground">{formatVnd(data.price)}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`sku-stock-${index}`} className="text-xs font-medium">
              Tồn kho *
            </Label>
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

        <ImageUploadField
          label="Ảnh SKU (tùy chọn)"
          description="Dùng khi biến thể có hình khác ảnh SPU"
          value={data.imgUrl}
          onChange={(imgUrl) => onChange({ ...data, imgUrl })}
          onError={(msg) => toast.error(msg)}
        />
      </div>
    </div>
  )
}
