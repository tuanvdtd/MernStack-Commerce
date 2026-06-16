import { useEffect, useId, useRef, useState } from "react"
import type { DragEvent } from "react"
import { ImagePlus, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE,
  singleFileValidator,
} from "~/lib/fileValidator"
import { cn } from "~/lib/utils"

const ACCEPT = ALLOW_COMMON_FILE_TYPES.join(",")

export type ImageUploadChangeMeta = {
  file?: File | null
  previousUrl?: string
}

type ImageUploadFieldProps = {
  label: string
  description?: string
  value: string
  onChange: (value: string, meta?: ImageUploadChangeMeta) => void
  onError?: (message: string) => void
  className?: string
}

const revokeBlobUrl = (url: string | undefined) => {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url)
  }
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
  const previewRef = useRef(value)

  useEffect(() => {
    previewRef.current = value
  }, [value])

  useEffect(() => {
    return () => {
      revokeBlobUrl(previewRef.current)
    }
  }, [])

  const handleFile = (file: File | undefined) => {
    if (!file) return

    const validationError = singleFileValidator(file)
    if (validationError) {
      onError?.(validationError)
      return
    }

    const previousUrl = value || undefined
    revokeBlobUrl(previousUrl)

    const previewUrl = URL.createObjectURL(file)
    onChange(previewUrl, { file, previousUrl })
  }

  const handleRemove = () => {
    const previousUrl = value || undefined
    revokeBlobUrl(previousUrl)
    onChange("", { file: null, previousUrl })
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
    handleFile(file)
  }

  const maxMb = LIMIT_COMMON_FILE_SIZE / (1024 * 1024)

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
          handleFile(e.target.files?.[0])
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
            alt="Preview"
            className="size-24 shrink-0 rounded-lg border border-border object-cover"
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              {isDragging
                ? "Drop image to replace"
                : "The image will be uploaded when you save the product"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Change image
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleRemove}
            >
              <Trash2 className="size-4" aria-hidden />
              Remove image
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
            {isDragging ? "Drop the image here" : "Choose or drag and drop an image"}
          </span>
          <span className="text-xs">
            JPG, JPEG, PNG - up to {maxMb}MB. Uploaded to Cloudinary on save.
          </span>
        </button>
      )}
    </div>
  )
}
