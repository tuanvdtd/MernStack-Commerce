import { useEffect, useId, useRef, useState } from "react"
import type { DragEvent } from "react"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE,
  singleFileValidator,
} from "~/lib/fileValidator"
import { uploadProductImage } from "~/apis/uploadApi"
import { cn } from "~/lib/utils"

const ACCEPT = ALLOW_COMMON_FILE_TYPES.join(",")

export type ImageUploadChangeMeta = {
  file?: File | null
  previousUrl?: string
  publicId?: string
}

type ImageUploadFieldProps = {
  label: string
  description?: string
  value: string
  onChange: (value: string, meta?: ImageUploadChangeMeta) => void
  onError?: (message: string) => void
  className?: string
  /** Square tile, Shopify dropzone, or default block. */
  variant?: "default" | "tile" | "dropzone"
  /** Hide the field label (when the parent section already shows it). */
  hideLabel?: boolean
  /** Upload lên Cloudinary ngay khi chọn file (không dùng blob preview). */
  uploadOnSelect?: boolean
  onUploadStart?: () => void
  onUploadEnd?: () => void
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
  variant = "default",
  hideLabel = false,
  uploadOnSelect = false,
  onUploadStart,
  onUploadEnd,
}: ImageUploadFieldProps) => {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const previewRef = useRef(value)

  useEffect(() => {
    previewRef.current = value
  }, [value])

  useEffect(() => {
    return () => {
      revokeBlobUrl(previewRef.current)
    }
  }, [])

  const handleFile = async (file: File | undefined) => {
    if (!file) return

    const validationError = singleFileValidator(file)
    if (validationError) {
      onError?.(validationError)
      return
    }

    const previousUrl = value || undefined

    if (uploadOnSelect) {
      setIsUploading(true)
      onUploadStart?.()
      try {
        const result = await uploadProductImage(file)
        onChange(result.secureUrl, {
          previousUrl,
          publicId: result.publicId,
        })
      } catch {
        onError?.("Unable to upload the image.")
      } finally {
        setIsUploading(false)
        onUploadEnd?.()
      }
      return
    }

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
    void handleFile(file)
  }

  const maxMb = LIMIT_COMMON_FILE_SIZE / (1024 * 1024)

  const dropZoneClass = cn(
    "rounded-lg border border-dashed transition-colors",
    isDragging
      ? "border-[var(--admin-brand)] bg-[var(--admin-brand)]/5"
      : "border-border/80 bg-muted/20 hover:border-border",
    variant === "tile" && "rounded-lg"
  )

  const fileInput = (
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
  )

  const dragHandlers = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  }

  if (variant === "dropzone") {
    return (
      <div className={cn("space-y-3", className)}>
        {fileInput}
        {!hideLabel ? <Label htmlFor={inputId}>{label}</Label> : null}

        {value ? (
          <div className="flex flex-wrap items-start gap-3">
            <div className="group relative size-[4.75rem] overflow-hidden rounded-lg border border-border bg-muted/30">
              <img
                src={value}
                alt={label}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => inputRef.current?.click()}
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className="size-7"
                  onClick={handleRemove}
                  aria-label="Remove image"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              {...dragHandlers}
              aria-label="Add or replace image"
              className={cn(
                "flex size-[4.75rem] items-center justify-center text-muted-foreground",
                dropZoneClass
              )}
            >
              <ImagePlus className="size-5" aria-hidden />
            </button>
          </div>
        ) : (
          <div
            {...dragHandlers}
            className={cn(
              "flex min-h-[7.5rem] flex-col items-center justify-center gap-3 px-4 py-8 text-center",
              dropZoneClass
            )}
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 bg-background text-[13px] shadow-none"
                onClick={() => inputRef.current?.click()}
              >
                Upload new
              </Button>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-8 px-2 text-[13px] text-[var(--admin-brand)]"
                onClick={() => inputRef.current?.click()}
              >
                Select existing
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isDragging
                ? "Drop the image here"
                : `Accepts JPG, JPEG, PNG — up to ${maxMb}MB`}
            </p>
          </div>
        )}

        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    )
  }

  if (variant === "tile") {
    return (
      <div className={cn("space-y-2", className)}>
        {fileInput}

        {value ? (
          <div className="group relative aspect-square w-full max-w-[7.5rem] overflow-hidden rounded-lg border border-border">
            <img
              src={value}
              alt={label}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 flex items-end justify-center gap-1 bg-linear-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => inputRef.current?.click()}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="size-7"
                onClick={handleRemove}
                aria-label="Remove image"
              >
                <Trash2 className="size-3.5" />
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
            aria-label={label}
            className={cn(
              "flex aspect-square w-full max-w-[7.5rem] flex-col items-center justify-center gap-1 p-2 text-muted-foreground",
              dropZoneClass
            )}
          >
            <ImagePlus className="size-6" aria-hidden />
            <span className="text-[11px] font-medium text-foreground">
              {isDragging ? "Drop" : "Upload"}
            </span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {!hideLabel ? <Label htmlFor={inputId}>{label}</Label> : null}
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}

      {fileInput}

      {value ? (
        <div
          className={cn("flex max-w-md items-start gap-4 p-3", dropZoneClass)}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border">
            <img
              src={value}
              alt="Preview"
              className="size-full object-cover"
            />
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="size-6 animate-spin text-white" />
              </div>
            ) : null}
          </div>
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
