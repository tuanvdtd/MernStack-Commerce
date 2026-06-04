import { useId, useRef, useState } from "react"
import type { DragEvent } from "react"
import { ImagePlus, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { cn } from "~/lib/utils"

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif"

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Không đọc được file ảnh"))
    reader.readAsDataURL(file)
  })

type ImageUploadFieldProps = {
  label: string
  description?: string
  value: string
  onChange: (value: string) => void
  onError?: (message: string) => void
  className?: string
}

export const ImageUploadField = ({
  label,
  description,
  value,
  onChange,
  onError,
  className,
}: ImageUploadFieldProps) => {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      onError?.("Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)")
      return
    }
    if (file.size > MAX_BYTES) {
      onError?.("Ảnh tối đa 5MB")
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      onChange(dataUrl)
    } catch {
      onError?.("Không đọc được file ảnh")
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    void handleFile(file)
  }

  const dropZoneClass = cn(
    "rounded-xl border border-dashed transition-colors",
    isDragging
      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
      : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50"
  )

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={inputId}>{label}</Label>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />

      {value ? (
        <div
          className={cn("flex max-w-md items-start gap-4 p-3", dropZoneClass)}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <img
            src={value}
            alt="Xem trước"
            className="size-24 shrink-0 rounded-lg border border-border object-cover"
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              {isDragging ? "Thả ảnh để thay thế" : "Kéo thả ảnh mới hoặc"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Đổi ảnh
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onChange("")}
            >
              <Trash2 className="size-4" aria-hidden />
              Xóa ảnh
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "flex w-full max-w-md flex-col items-center justify-center gap-2 px-6 py-8 text-sm text-muted-foreground",
            dropZoneClass
          )}
        >
          <ImagePlus
            className={cn(
              "size-8",
              isDragging ? "text-primary" : "text-muted-foreground"
            )}
            aria-hidden
          />
          <span className="font-medium text-foreground">
            {isDragging ? "Thả ảnh vào đây" : "Chọn hoặc kéo thả ảnh"}
          </span>
          <span className="text-xs">JPEG, PNG, WebP, GIF — tối đa 5MB</span>
        </button>
      )}
    </div>
  )
}
