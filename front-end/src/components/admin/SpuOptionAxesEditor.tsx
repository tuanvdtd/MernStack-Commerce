import { Plus, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Badge } from "~/components/ui/badge"
import { CatalogCreatablePicker } from "~/components/admin/CatalogCreatablePicker"
import {
  addCatalogOption,
  getCatalogLabel,
  type OptionCatalogEntry,
} from "~/lib/admin/optionCatalog"
import { toast } from "sonner"

type SpuOptionAxesEditorProps = {
  axes: string[]
  onChange: (axes: string[]) => void
  optionCatalog: OptionCatalogEntry[]
  onCatalogChange: (catalog: OptionCatalogEntry[]) => void
}

export const SpuOptionAxesEditor = ({
  axes,
  onChange,
  optionCatalog,
  onCatalogChange,
}: SpuOptionAxesEditorProps) => {
  const catalogAxisNames = optionCatalog.map((e) => e.name)

  const axesAvailableForIndex = (index: number) => {
    const current = axes[index]
    return catalogAxisNames.filter(
      (name) => name === current || !axes.includes(name)
    )
  }

  const axesAvailableToAdd = catalogAxisNames.filter((name) => !axes.includes(name))

  const handleReplaceAxis = (index: number, newName: string) => {
    const oldName = axes[index]
    if (newName === oldName) return
    if (axes.includes(newName)) {
      toast.error(`Trục "${newName}" đã có trên SPU`)
      return
    }
    onChange(axes.map((a, i) => (i === index ? newName : a)))
  }

  const handleAddAxis = (name: string) => {
    if (axes.includes(name)) {
      toast.error(`Trục "${name}" đã có trên SPU`)
      return
    }
    onChange([...axes, name])
  }

  const handleCreateAxis = (rawName: string): string | null => {
    const result = addCatalogOption(optionCatalog, rawName)
    if ("error" in result) {
      toast.error(result.error)
      return null
    }
    onCatalogChange(result.catalog)
    return result.name
  }

  const handleRemove = (index: number) => {
    if (axes.length <= 1) return
    onChange(axes.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Label className="text-sm font-medium">Trục biến thể (Option) *</Label>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Mọi SKU dùng chung bộ trục. Chọn từ catalog hoặc thêm trục mới.
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {axes.length} trục
        </Badge>
      </div>

      <ul className="space-y-2">
        {axes.map((axisName, index) => (
          <li
            key={`${axisName}-${index}`}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border border-border bg-background p-2 sm:gap-3 sm:p-3"
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground"
              aria-hidden
            >
              {index + 1}
            </span>
            <CatalogCreatablePicker
              className="min-w-0"
              value={axisName}
              onChange={(name) => handleReplaceAxis(index, name)}
              options={axesAvailableForIndex(index)}
              formatOption={(name) => {
                const label = getCatalogLabel(optionCatalog, name)
                return label === name ? name : `${label} (${name})`
              }}
              placeholder="Chọn trục Option"
              createPlaceholder="Tên trục mới (VD: Material)"
              createButtonLabel="Thêm trục"
              onCreate={(raw) => {
                const name = handleCreateAxis(raw)
                if (name) handleReplaceAxis(index, name)
              }}
            />
            {axes.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemove(index)}
                aria-label={`Xóa trục ${axisName}`}
                className="shrink-0"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            ) : (
              <span className="size-8 shrink-0" aria-hidden />
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Plus className="size-4 shrink-0" aria-hidden />
          <span className="font-medium text-foreground">Thêm trục</span>
        </div>
        <CatalogCreatablePicker
          className="min-w-0 flex-1 sm:max-w-sm"
          value=""
          onChange={handleAddAxis}
          options={axesAvailableToAdd}
          formatOption={(name) => {
            const label = getCatalogLabel(optionCatalog, name)
            return label === name ? name : `${label} (${name})`
          }}
          placeholder="Chọn hoặc tạo trục mới"
          createPlaceholder="Tên trục mới (VD: Warranty)"
          createButtonLabel="Thêm trục"
          onCreate={(raw) => {
            const name = handleCreateAxis(raw)
            if (name) handleAddAxis(name)
          }}
        />
      </div>
    </div>
  )
}
