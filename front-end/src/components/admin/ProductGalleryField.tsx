import { useCallback, useId, useRef, useState } from "react"
import type { DragEvent } from "react"
import { GripVertical, ImagePlus, Loader2, Star, Trash2 } from "lucide-react"
import { uploadProductImage } from "~/apis/uploadApi"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE,
  singleFileValidator,
} from "~/lib/fileValidator"
import { cn } from "~/lib/utils"

const ACCEPT = ALLOW_COMMON_FILE_TYPES.join(",")
const MAX_GALLERY_IMAGES = 9

export type ProductGalleryImage = {
  url: string
  publicId: string
  sortOrder: number
  alt?: string
}

type ProductGalleryFieldProps = {
  label?: string
  value: ProductGalleryImage[]
  onChange: (images: ProductGalleryImage[]) => void
  onImageUploaded?: (
    previousUrl: string,
    url: string,
    publicId: string
  ) => void | Promise<void>
  onImageRemoved?: (url: string) => void | Promise<void>
  onError?: (message: string) => void
  className?: string
  hideLabel?: boolean
}

type UploadingItem = {
  localId: string
  fileName: string
}

/** Chuẩn hóa sortOrder liên tục 0..n-1 sau reorder hoặc xóa. */
const normalizeGalleryImages = (
  images: ProductGalleryImage[]
): ProductGalleryImage[] =>
  images.map((image, index) => ({
    ...image,
    sortOrder: index,
  }))

export const ProductGalleryField = ({
  label = "Media",
  value,
  onChange,
  onImageUploaded,
  onImageRemoved,
  onError,
  className,
  hideLabel = false,
}: ProductGalleryFieldProps) => {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const dragIndexRef = useRef<number | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [uploadingItems, setUploadingItems] = useState<UploadingItem[]>([])

  const sortedImages = [...value].sort((a, b) => a.sortOrder - b.sortOrder)
  const canAddMore = sortedImages.length + uploadingItems.length < MAX_GALLERY_IMAGES
  const maxMb = LIMIT_COMMON_FILE_SIZE / (1024 * 1024)

  const updateImages = useCallback(
    (nextImages: ProductGalleryImage[]) => {
      onChange(normalizeGalleryImages(nextImages))
    },
    [onChange]
  )

  /** Upload từng file lên Cloudinary ngay khi chọn, rồi append vào gallery. */
  const handleFiles = async (files: FileList | File[] | null | undefined) => {
    if (!files?.length) return

    const fileList = Array.from(files)
    const remainingSlots = MAX_GALLERY_IMAGES - value.length - uploadingItems.length

    if (remainingSlots <= 0) {
      onError?.(`Gallery supports up to ${MAX_GALLERY_IMAGES} images.`)
      return
    }

    const batch = fileList.slice(0, remainingSlots)
    const pending: UploadingItem[] = batch.map((file) => ({
      localId: crypto.randomUUID(),
      fileName: file.name,
    }))
    setUploadingItems((prev) => [...prev, ...pending])

    const uploadedImages: ProductGalleryImage[] = []

    for (let index = 0; index < batch.length; index++) {
      const file = batch[index]
      const pendingItem = pending[index]

      const validationError = singleFileValidator(file)
      if (validationError) {
        onError?.(validationError)
        setUploadingItems((prev) =>
          prev.filter((item) => item.localId !== pendingItem.localId)
        )
        continue
      }

      try {
        const result = await uploadProductImage(file)
        await onImageUploaded?.("", result.secureUrl, result.publicId)
        uploadedImages.push({
          url: result.secureUrl,
          publicId: result.publicId,
          sortOrder: value.length + uploadedImages.length,
        })
      } catch {
        onError?.(`Unable to upload ${file.name}.`)
      } finally {
        setUploadingItems((prev) =>
          prev.filter((item) => item.localId !== pendingItem.localId)
        )
      }
    }

    if (uploadedImages.length > 0) {
      onChange(normalizeGalleryImages([...value, ...uploadedImages]))
    }
  }

  /** Xóa ảnh khỏi gallery và dọn orphan trên Cloudinary nếu chưa commit. */
  const handleRemove = async (index: number) => {
    const target = sortedImages[index]
    if (!target) return

    await onImageRemoved?.(target.url)
    updateImages(sortedImages.filter((_, itemIndex) => itemIndex !== index))
  }

  /** Reorder gallery bằng native drag-and-drop. */
  const handleDropReorder = (targetIndex: number) => {
    const sourceIndex = dragIndexRef.current
    dragIndexRef.current = null
    if (sourceIndex === null || sourceIndex === targetIndex) return

    const next = [...sortedImages]
    const [moved] = next.splice(sourceIndex, 1)
    next.splice(targetIndex, 0, moved)
    updateImages(next)
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleZoneDragEnter = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDraggingOver(true)
  }

  const handleZoneDragLeave = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDraggingOver(false)
    }
  }

  const handleZoneDrop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDraggingOver(false)
    void handleFiles(event.dataTransfer.files)
  }

  return (
    <div className={cn("space-y-3", className)}>
      {!hideLabel ? <Label htmlFor={inputId}>{label}</Label> : null}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(event) => {
          void handleFiles(event.target.files)
          event.target.value = ""
        }}
      />

      <div className="flex flex-wrap items-start gap-3">
        {sortedImages.map((image, index) => (
          <div
            key={image.publicId}
            draggable
            onDragStart={() => {
              dragIndexRef.current = index
            }}
            onDragOver={handleDragOver}
            onDrop={(event) => {
              event.preventDefault()
              event.stopPropagation()
              handleDropReorder(index)
            }}
            className="group relative size-[4.75rem] overflow-hidden rounded-lg border border-border bg-muted/30"
          >
            <img
              src={image.url}
              alt={image.alt ?? `Product image ${index + 1}`}
              className="size-full object-cover"
            />

            {index === 0 ? (
              <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded bg-black/55 px-1 py-0.5 text-[10px] font-medium text-white">
                <Star className="size-2.5 fill-current" aria-hidden />
                Chính
              </span>
            ) : null}

            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <span
                className="inline-flex size-7 cursor-grab items-center justify-center rounded-md bg-secondary text-secondary-foreground active:cursor-grabbing"
                aria-hidden
              >
                <GripVertical className="size-3.5" />
              </span>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="size-7"
                onClick={() => void handleRemove(index)}
                aria-label="Remove image"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {uploadingItems.map((item) => (
          <div
            key={item.localId}
            className="flex size-[4.75rem] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/20 px-1 text-center"
          >
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="line-clamp-2 text-[9px] text-muted-foreground">
              {item.fileName}
            </span>
          </div>
        ))}

        {canAddMore ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleZoneDragEnter}
            onDragLeave={handleZoneDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleZoneDrop}
            aria-label="Add product images"
            className={cn(
              "flex size-[4.75rem] items-center justify-center rounded-lg border border-dashed transition-colors",
              isDraggingOver
                ? "border-[var(--admin-brand)] bg-[var(--admin-brand)]/5 text-[var(--admin-brand)]"
                : "border-border/80 bg-muted/20 text-muted-foreground hover:border-border"
            )}
          >
            <ImagePlus className="size-5" aria-hidden />
          </button>
        ) : null}
      </div>

      {sortedImages.length === 0 && uploadingItems.length === 0 ? (
        <div
          onDragEnter={handleZoneDragEnter}
          onDragLeave={handleZoneDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleZoneDrop}
          className={cn(
            "flex min-h-[7.5rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
            isDraggingOver
              ? "border-[var(--admin-brand)] bg-[var(--admin-brand)]/5"
              : "border-border/80 bg-muted/20"
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 bg-background text-[13px] shadow-none"
            onClick={() => inputRef.current?.click()}
          >
            Upload images
          </Button>
          <p className="text-xs text-muted-foreground">
            {isDraggingOver
              ? "Drop images here"
              : `Up to ${MAX_GALLERY_IMAGES} images · JPG, JPEG, PNG · ${maxMb}MB each`}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Drag to reorder. The first image is the storefront thumbnail.
        </p>
      )}
    </div>
  )
}
