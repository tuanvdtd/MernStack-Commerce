import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"

type MenuPosition = {
  left: number
  width: number
  maxHeight: number
  top?: number
  bottom?: number
}

type OptionValueMultiPickerProps = {
  selectedValues: string[]
  onSelectedValuesChange: (values: string[]) => void
  options: string[]
  onCreate?: (value: string) => boolean | void
  placeholder?: string
  formatOption?: (value: string) => string
  createPlaceholder?: string
  createButtonLabel?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
}

const MENU_GAP = 4
const MENU_MIN_HEIGHT = 140
const MENU_MAX_HEIGHT = 320
const CREATE_BLOCK_HEIGHT = 96

/** Ước lượng chiều cao menu theo số option và block tạo mới. */
const estimateMenuHeight = (optionCount: number, hasCreate: boolean): number => {
  const listHeight = Math.min(260, Math.max(72, optionCount * 36 + 16))
  return Math.min(
    MENU_MAX_HEIGHT,
    listHeight + (hasCreate ? CREATE_BLOCK_HEIGHT : 0)
  )
}

/** Menu chọn nhiều OptionValue bằng checkbox; giá trị đã chọn được tích sẵn. */
export const OptionValueMultiPicker = ({
  selectedValues,
  onSelectedValuesChange,
  options,
  onCreate,
  placeholder = "Add value",
  formatOption = (value) => value,
  createPlaceholder = "Enter new value...",
  createButtonLabel = "Add",
  disabled = false,
  className,
  triggerClassName,
}: OptionValueMultiPickerProps) => {
  const listId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null)

  const menuOptions = useMemo(
    () => [...new Set([...options, ...selectedValues].filter(Boolean))],
    [options, selectedValues]
  )

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues])

  /** Cập nhật vị trí popover theo trigger. */
  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP
    const spaceAbove = rect.top - MENU_GAP
    const wantedHeight = estimateMenuHeight(menuOptions.length, Boolean(onCreate))
    const openUp = spaceBelow < wantedHeight && spaceAbove >= spaceBelow
    const available = Math.max(
      MENU_MIN_HEIGHT,
      Math.min(MENU_MAX_HEIGHT, openUp ? spaceAbove : spaceBelow)
    )

    setMenuPosition(
      openUp
        ? {
            left: rect.left,
            width: Math.max(rect.width, 280),
            bottom: window.innerHeight - rect.top + MENU_GAP,
            maxHeight: available,
          }
        : {
            left: rect.left,
            width: Math.max(rect.width, 280),
            top: rect.bottom + MENU_GAP,
            maxHeight: available,
          }
    )
  }, [menuOptions.length, onCreate])

  useLayoutEffect(() => {
    if (!open) return
    triggerRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" })
    updateMenuPosition()
    window.addEventListener("resize", updateMenuPosition)
    window.addEventListener("scroll", updateMenuPosition, true)
    return () => {
      window.removeEventListener("resize", updateMenuPosition)
      window.removeEventListener("scroll", updateMenuPosition, true)
    }
  }, [open, updateMenuPosition])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  /** Bật/tắt một giá trị trong danh sách đã chọn. */
  const toggleValue = (value: string, checked: boolean) => {
    if (checked) {
      if (selectedSet.has(value)) return
      onSelectedValuesChange([...selectedValues, value])
      return
    }

    onSelectedValuesChange(selectedValues.filter((item) => item !== value))
  }

  /** Tạo giá trị mới và tự chọn sau khi thêm. */
  const handleCreate = () => {
    const trimmed = draft.trim()
    if (!trimmed) return

    if (menuOptions.includes(trimmed)) {
      toggleValue(trimmed, true)
      setDraft("")
      return
    }

    if (onCreate?.(trimmed) === false) return
    if (!selectedSet.has(trimmed)) {
      onSelectedValuesChange([...selectedValues, trimmed])
    }
    setDraft("")
  }

  const menu =
    open && menuPosition ? (
      <div
        ref={menuRef}
        id={listId}
        role="listbox"
        aria-multiselectable="true"
        style={{
          position: "fixed",
          left: menuPosition.left,
          width: menuPosition.width,
          top: menuPosition.top,
          bottom: menuPosition.bottom,
          maxHeight: menuPosition.maxHeight,
          zIndex: 9999,
        }}
        className="flex flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-1">
          {menuOptions.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              No values yet — add a new one below
            </p>
          ) : (
            menuOptions.map((option) => {
              const checked = selectedSet.has(option)
              return (
                <label
                  key={option}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-accent",
                    checked && "bg-accent/60"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) =>
                      toggleValue(option, next === true)
                    }
                    aria-label={formatOption(option)}
                  />
                  <span className="truncate">{formatOption(option)}</span>
                </label>
              )
            })
          )}
        </div>

        {onCreate ? (
          <div className="shrink-0 border-t border-border bg-muted/30 p-2">
            <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
              Add new
            </p>
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={createPlaceholder}
                className="h-8 text-sm"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleCreate()
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                className="shrink-0 gap-1"
                onClick={handleCreate}
                disabled={!draft.trim()}
              >
                <Plus className="size-3.5" aria-hidden />
                {createButtonLabel}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    ) : null

  return (
    <div className={cn("relative", className)}>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className={cn(
          "h-10 w-full justify-start border-input bg-transparent font-normal shadow-none hover:bg-transparent hover:text-foreground",
          "text-muted-foreground",
          triggerClassName
        )}
        onClick={() => {
          setOpen((current) => !current)
          if (!open) setDraft("")
        }}
      >
        <span className="truncate">{placeholder}</span>
      </Button>

      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  )
}
