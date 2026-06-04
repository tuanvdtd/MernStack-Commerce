import { Plus, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
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
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div>
        <Label>Trục biến thể (Option) *</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Chọn từ catalog hoặc thêm trục mới — mọi SKU dùng chung bộ trục này
        </p>
      </div>

      <ul className="space-y-2">
        {axes.map((axisName, index) => (
          <li
            key={`${axisName}-${index}`}
            className="flex items-center gap-2 rounded-md bg-muted/40 p-2"
          >
            <CatalogCreatablePicker
              className="flex-1"
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
            {axes.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemove(index)}
                aria-label={`Xóa trục ${axisName}`}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Plus className="size-4 text-muted-foreground" aria-hidden />
        <CatalogCreatablePicker
          className="max-w-xs flex-1"
          value=""
          onChange={handleAddAxis}
          options={axesAvailableToAdd}
          formatOption={(name) => {
            const label = getCatalogLabel(optionCatalog, name)
            return label === name ? name : `${label} (${name})`
          }}
          placeholder="Thêm trục Option"
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
