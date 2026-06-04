import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Check, ChevronDown, Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"

type MenuPosition = {
  left: number
  width: number
  maxHeight: number
  top?: number
  bottom?: number
}

type CatalogCreatablePickerProps = {
  value: string
  onChange: (value: string) => void
  options: string[]
  onCreate?: (value: string) => void
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
/** Chiều cao ước lượng khi có block Thêm mới */
const CREATE_BLOCK_HEIGHT = 96

const estimateMenuHeight = (optionCount: number, hasCreate: boolean): number => {
  const listHeight = Math.min(220, Math.max(72, optionCount * 36 + 16))
  return Math.min(
    MENU_MAX_HEIGHT,
    listHeight + (hasCreate ? CREATE_BLOCK_HEIGHT : 0)
  )
}

export const CatalogCreatablePicker = ({
  value,
  onChange,
  options,
  onCreate,
  placeholder = "Chọn hoặc thêm mới",
  formatOption = (v) => v,
  createPlaceholder = "Nhập giá trị mới…",
  createButtonLabel = "Thêm",
  disabled = false,
  className,
  triggerClassName,
}: CatalogCreatablePickerProps) => {
  const listId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null)

  const uniqueOptions = [...new Set(options.filter(Boolean))]

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP
    const spaceAbove = rect.top - MENU_GAP
    const wantedHeight = estimateMenuHeight(
      uniqueOptions.length,
      Boolean(onCreate)
    )

    const openUp =
      spaceBelow < wantedHeight && spaceAbove >= spaceBelow

    const available = Math.max(
      MENU_MIN_HEIGHT,
      Math.min(MENU_MAX_HEIGHT, openUp ? spaceAbove : spaceBelow)
    )

    setMenuPosition(
      openUp
        ? {
            left: rect.left,
            width: Math.max(rect.width, 240),
            bottom: window.innerHeight - rect.top + MENU_GAP,
            maxHeight: available,
          }
        : {
            left: rect.left,
            width: Math.max(rect.width, 240),
            top: rect.bottom + MENU_GAP,
            maxHeight: available,
          }
    )
  }, [uniqueOptions.length, onCreate])

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
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node
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

  const display = value ? formatOption(value) : null

  const handleSelect = (next: string) => {
    onChange(next)
    setOpen(false)
    setDraft("")
  }

  const handleCreate = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    if (uniqueOptions.includes(trimmed)) {
      handleSelect(trimmed)
      return
    }
    onCreate?.(trimmed)
    onChange(trimmed)
    setOpen(false)
    setDraft("")
  }

  const menu =
    open && menuPosition ? (
      <div
        ref={menuRef}
        id={listId}
        role="listbox"
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
          {uniqueOptions.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              Chưa có dữ liệu — thêm mới bên dưới
            </p>
          ) : (
            uniqueOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={value === opt}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                  value === opt && "bg-accent"
                )}
                onClick={() => handleSelect(opt)}
              >
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    value === opt ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden
                />
                <span className="truncate">{formatOption(opt)}</span>
              </button>
            ))
          )}
        </div>

        {onCreate ? (
          <div className="shrink-0 border-t border-border bg-muted/30 p-2">
            <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
              Thêm mới
            </p>
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={createPlaceholder}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
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
          "h-9 w-full justify-between font-normal",
          !display && "text-muted-foreground",
          triggerClassName
        )}
        onClick={() => {
          setOpen((o) => !o)
          if (!open) setDraft("")
        }}
      >
        <span className="truncate">{display ?? placeholder}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 opacity-50", open && "rotate-180")}
          aria-hidden
        />
      </Button>

      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  )
}
