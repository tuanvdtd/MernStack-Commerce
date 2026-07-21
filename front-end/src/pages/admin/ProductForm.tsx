import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAdminStore } from "~/stores/adminStore"
import type { SPU } from "~/types/admin/index"
import { findCategoryById } from "~/lib/admin/categoryCatalog"
import { createCategory, fetchCategories } from "~/apis/categoryApi"
import { fetchOptionCatalog } from "~/apis/optionApi"
import {
  createProduct,
  getProductApiError,
  fetchProductById,
  patchProductSpu,
  updateProductVariants,
  type CreateProductPayload,
  type PatchProductSpuPayload,
  type ProductImageFiles,
  type UpdateProductVariantsPayload,
} from "~/apis/productApi"
import { isFieldDirty } from "~/lib/admin/getDirtyValues"
import { CatalogCreatablePicker } from "~/components/admin/CatalogCreatablePicker"
import { AdminFormShell, AdminFormLayout } from "~/components/admin/AdminFormShell"
import { AdminFormCard } from "~/components/admin/AdminFormCard"
import { ProductFormSidebar } from "~/components/admin/ProductFormSidebar"
import { ProductVariantsSection } from "~/components/admin/ProductVariantsSection"
import type { OptionCatalogEntry } from "~/lib/admin/optionCatalog"
import {
  createDefaultVariant,
  defaultProductFormValues,
  productFormSchema,
  type ProductFormValues,
} from "~/lib/admin/productFormSchema"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AdminPage } from "~/components/admin/AdminPage"
import { AdminPageHeader } from "~/components/admin/AdminPageHeader"
import {
  ImageUploadField,
  type ImageUploadChangeMeta,
} from "~/components/admin/ImageUploadField"
import { adminBrandButtonClass, adminFormFieldLabelClass } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"
import { deriveOptionAxes } from "~/lib/admin/productUtils"
import { SimpleEditor } from "~/components/tiptap-templates/simple/simple-editor"
import type { AdminCategory } from "~/types/admin/index"

const classificationSelectClass =
  "h-10 min-h-10 w-full justify-between rounded-lg border-input bg-transparent px-2.5 text-sm shadow-none"

const mapSpuToFormValues = (product: SPU): ProductFormValues => {
  const optionAxes = product.optionAxes?.length
    ? product.optionAxes
    : deriveOptionAxes(product)

  return {
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    brand: product.brand,
    imgUrl: product.imgUrl ?? "",
    isActive: product.isActive,
    optionAxes,
    variants:
      product.skus.length > 0
        ? product.skus.map((sku) => ({
            id: sku.id,
            price: sku.price,
            stockQuantity: sku.stockQuantity,
            imgUrl: sku.imgUrl ?? "",
            options: optionAxes.map((optionName) => ({
              optionName,
              value:
                sku.options.find((o) => o.optionName === optionName)?.value ??
                "",
            })),
          }))
        : [createDefaultVariant(optionAxes)],
  }
}

const isRemoteImageUrl = (url: string | undefined) =>
  Boolean(url?.trim() && /^https?:\/\//i.test(url.trim()))

const cloneFormValues = (values: ProductFormValues): ProductFormValues => ({
  ...values,
  optionAxes: [...values.optionAxes],
  variants: values.variants.map((variant) => ({
    ...variant,
    options: variant.options.map((option) => ({ ...option })),
  })),
})

const mapVariantToPayload = (
  variant: ProductFormValues["variants"][number]
) => ({
  ...(variant.id ? { id: variant.id } : {}),
  price: variant.price,
  stockQuantity: variant.stockQuantity,
  ...(isRemoteImageUrl(variant.imgUrl)
    ? { imgUrl: variant.imgUrl!.trim() }
    : {}),
  options: variant.options.map((option) => ({
    optionName: option.optionName,
    value: option.value.trim(),
  })),
})

const mapFormToPayload = (values: ProductFormValues): CreateProductPayload => ({
  name: values.name.trim(),
  description: values.description.trim(),
  categoryId: values.categoryId,
  brand: values.brand,
  imgUrl: isRemoteImageUrl(values.imgUrl) ? values.imgUrl.trim() : "",
  isActive: values.isActive,
  optionAxes: values.optionAxes,
  variants: values.variants.map(mapVariantToPayload),
})

/** Variant payload: gửi full danh sách để BE đồng bộ theo id. */
const mapFormToVariantsPayload = (
  values: ProductFormValues
): UpdateProductVariantsPayload => ({
  optionAxes: values.optionAxes,
  variants: values.variants.map(mapVariantToPayload),
})

/**
 * Build a PATCH SPU payload from React Hook Form dirtyFields.
 * Include only changed fields; blob images are sent via multipart, not temporary URLs.
 */
const buildSpuPatchPayload = (
  values: ProductFormValues,
  dirtyFields: Record<string, unknown>,
  hasSpuImage: boolean
): PatchProductSpuPayload => {
  const patch: PatchProductSpuPayload = {}

  if (isFieldDirty(dirtyFields, "name")) {
    patch.name = values.name.trim()
  }
  if (isFieldDirty(dirtyFields, "description")) {
    patch.description = values.description.trim()
  }
  if (isFieldDirty(dirtyFields, "categoryId")) {
    patch.categoryId = values.categoryId
  }
  if (isFieldDirty(dirtyFields, "brand")) {
    patch.brand = values.brand
  }
  if (isFieldDirty(dirtyFields, "isActive")) {
    patch.isActive = values.isActive
  }
  if (isFieldDirty(dirtyFields, "optionAxes")) {
    patch.optionAxes = values.optionAxes
  }
  if (isFieldDirty(dirtyFields, "imgUrl") || hasSpuImage) {
    patch.imgUrl = isRemoteImageUrl(values.imgUrl) ? values.imgUrl.trim() : ""
  }

  return patch
}

export function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addProduct, updateProduct } = useAdminStore()
  const [categoryCatalog, setCategoryCatalog] = useState<AdminCategory[]>([])
  const [optionCatalog, setOptionCatalog] = useState<OptionCatalogEntry[]>([])
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(id))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const isEditMode = Boolean(id)
  const pendingImagesRef = useRef<{ spu?: File; skus: Record<number, File> }>({
    skus: {},
  })
  const committedFormRef = useRef<ProductFormValues | null>(null)
  const variantsSectionRef = useRef<HTMLDivElement>(null)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultProductFormValues(),
    mode: "onSubmit",
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  })

  const watchName = form.watch("name")
  const watchCategoryId = form.watch("categoryId")
  const watchImgUrl = form.watch("imgUrl")
  const watchIsActive = form.watch("isActive")
  const watchOptionAxes = form.watch("optionAxes")
  const watchVariants = form.watch("variants")
  const { isDirty } = form.formState

  const hasPendingImageChanges =
    Boolean(pendingImagesRef.current.spu) ||
    Object.keys(pendingImagesRef.current.skus).length > 0
  const hasUnsavedChanges = isDirty || hasPendingImageChanges

  const skuStats = useMemo(() => {
    const prices = watchVariants.map((s) => s.price).filter((p) => p > 0)
    const minPrice = prices.length ? Math.min(...prices) : 0
    const maxPrice = prices.length ? Math.max(...prices) : 0
    const totalStock = watchVariants.reduce(
      (sum, s) => sum + (s.stockQuantity || 0),
      0
    )
    return { minPrice, maxPrice, totalStock }
  }, [watchVariants])

  useEffect(() => {
    let cancelled = false

    const loadCatalogs = async () => {
      try {
        const [categories, options] = await Promise.all([
          fetchCategories(),
          fetchOptionCatalog(),
        ])
        if (!cancelled) {
          setCategoryCatalog(categories)
          setOptionCatalog(options)
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getProductApiError(error))
        }
      }
    }

    void loadCatalogs()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const loadProduct = async () => {
      setIsLoading(true)
      try {
        const product = await fetchProductById(id)
        if (cancelled) return
        const formValues = mapSpuToFormValues(product)
        form.reset(formValues)
        committedFormRef.current = cloneFormValues(formValues)
        pendingImagesRef.current = { skus: {} }
        setLoadedSlug(product.slug)
        setCategoryCatalog((prev) => {
          if (prev.some((c) => c.id === product.categoryId)) return prev
          return [
            ...prev,
            {
              id: product.categoryId,
              name: product.categoryName,
              slug: product.categoryName.toLowerCase().replace(/\s+/g, "-"),
            },
          ]
        })
      } catch (error) {
        if (!cancelled) {
          toast.error(getProductApiError(error))
          navigate("/admin/products")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadProduct()
    return () => {
      cancelled = true
    }
  }, [id, form, navigate])

  const syncVariantsToAxes = (axes: string[]) => {
    const variants = form.getValues("variants")
    form.setValue(
      "variants",
      variants.map((variant) => ({
        ...variant,
        options: axes.map((optionName) => ({
          optionName,
          value:
            variant.options.find((o) => o.optionName === optionName)?.value ??
            "",
        })),
      })),
      { shouldValidate: false }
    )
  }

  const handleOptionAxesChange = (axes: string[]) => {
    form.setValue("optionAxes", axes, { shouldValidate: true })
    syncVariantsToAxes(axes)
  }

  const handleAddSku = () => {
    const axes = form.getValues("optionAxes")
    append(createDefaultVariant(axes))
  }

  const handleRemoveSku = (index: number) => {
    if (fields.length <= 1) {
      toast.error("SPU needs at least 1 SKU")
      return
    }
    remove(index)
  }

  /** Collect pending image files for multipart upload on save. */
  const collectPendingImageFiles = (): ProductImageFiles => ({
    spuImage: pendingImagesRef.current.spu,
    skuImages: { ...pendingImagesRef.current.skus },
  })

  const trackSpuImage = (meta?: ImageUploadChangeMeta) => {
    if (meta?.file) {
      pendingImagesRef.current.spu = meta.file
      return
    }
    if (meta?.file === null) {
      delete pendingImagesRef.current.spu
    }
  }

  const trackSkuImage = (index: number, meta?: ImageUploadChangeMeta) => {
    if (meta?.file) {
      pendingImagesRef.current.skus[index] = meta.file
      return
    }
    if (meta?.file === null) {
      delete pendingImagesRef.current.skus[index]
    }
  }

  /** Sync the store and reset the form after the API returns the latest SPU. */
  const applySavedProduct = (product: SPU) => {
    updateProduct(product.id, product)
    pendingImagesRef.current = { skus: {} }
    const formValues = mapSpuToFormValues(product)
    form.reset(formValues)
    committedFormRef.current = cloneFormValues(formValues)
    setLoadedSlug(product.slug)
    return product
  }

  /** Save step 1 in edit mode: PATCH partial SPU, skipping when unchanged. */
  const persistSpuPatch = async (values: ProductFormValues) => {
    if (!id) return

    const hasSpuImage = Boolean(pendingImagesRef.current.spu)
    const patch = buildSpuPatchPayload(
      values,
      form.formState.dirtyFields,
      hasSpuImage
    )

    if (Object.keys(patch).length === 0 && !hasSpuImage) return

    const product = await patchProductSpu(id, patch, {
      spuImage: pendingImagesRef.current.spu,
    })
    return applySavedProduct(product)
  }

  /** Save step 2 in edit mode: PUT all variants. */
  const persistVariants = async (values: ProductFormValues) => {
    if (!id) return

    const payload = mapFormToVariantsPayload(values)
    const product = await updateProductVariants(id, payload, {
      skuImages: { ...pendingImagesRef.current.skus },
    })
    return applySavedProduct(product)
  }

  /** Create mode: POST full SPU plus SKUs, then switch to edit mode. */
  const persistCreate = async (values: ProductFormValues) => {
    const payload = mapFormToPayload(values)
    const imageFiles = collectPendingImageFiles()
    const product = await createProduct(payload, imageFiles)
    addProduct(product)
    pendingImagesRef.current = { skus: {} }
    navigate(`/admin/products/edit/${product.id}`, { replace: true })
    return product
  }

  /** Revert the form to the last saved snapshot (edit) or empty defaults (create). */
  const handleDiscard = () => {
    pendingImagesRef.current = { skus: {} }

    if (isEditMode && committedFormRef.current) {
      form.reset(cloneFormValues(committedFormRef.current))
    } else {
      form.reset(defaultProductFormValues())
    }

    setDiscardDialogOpen(false)
    toast.message("Changes discarded")
  }

  const handleSaveProduct = form.handleSubmit(
    async (values) => {
      setIsSubmitting(true)
      try {
        if (id) {
          await persistSpuPatch(values)
          await persistVariants(values)
          toast.success("Product saved")
        } else {
          await persistCreate(values)
          toast.success("Product created")
        }
      } catch (error) {
        toast.error(getProductApiError(error))
      } finally {
        setIsSubmitting(false)
      }
    },
    () => {
      variantsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  )

  if (isLoading) {
    return (
      <AdminPage className="items-center justify-center gap-3 py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading product...</p>
      </AdminPage>
    )
  }

  return (
    <AdminPage className="gap-3 sm:gap-4">
      <AdminFormShell>
        <AdminPageHeader
          size="compact"
          className="mb-3 sm:mb-4"
          title={
            isEditMode
              ? watchName.trim() || "Edit product"
              : "Add product"
          }
          description={
            loadedSlug
              ? `/${loadedSlug}`
              : "URL slug is generated automatically when you save."
          }
          leading={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => navigate("/admin/products")}
              aria-label="Back to products"
            >
              <ArrowLeft className="size-4" />
            </Button>
          }
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "min-w-[5.5rem]",
                  "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-100 disabled:border-zinc-300 disabled:bg-zinc-200 disabled:text-zinc-600 disabled:shadow-none",
                  "dark:disabled:border-zinc-600 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
                )}
                disabled={!hasUnsavedChanges || isSubmitting}
                onClick={() => setDiscardDialogOpen(true)}
              >
                Discard
              </Button>
              <Button
                type="button"
                className={cn(adminBrandButtonClass, "min-w-[5.5rem] gap-2")}
                disabled={isSubmitting}
                onClick={() => void handleSaveProduct()}
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : null}
                {isEditMode ? "Save" : "Create"}
              </Button>
            </>
          }
        />

        <Form {...form}>
          <form onSubmit={handleSaveProduct}>
            <AdminFormLayout
              main={
                <>
                  <AdminFormCard
                    padding={false}
                    bodyClassName="space-y-5 px-3 py-3 sm:space-y-6 sm:px-4 sm:py-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={adminFormFieldLabelClass}>
                            Title
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Short sleeve t-shirt"
                              className="mt-2 h-10 border-border/80 text-[13px] shadow-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={adminFormFieldLabelClass}>
                            Description
                          </FormLabel>
                          <FormControl>
                            <div className="mt-2 overflow-hidden rounded-lg border border-border/80">
                              <SimpleEditor
                                embedded
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imgUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={adminFormFieldLabelClass}>
                            Media
                          </FormLabel>
                          <FormControl>
                            <div className="mt-2">
                              <ImageUploadField
                                label="Media"
                                hideLabel
                                variant="dropzone"
                                value={field.value}
                                onChange={(newValue, meta) => {
                                  trackSpuImage(meta)
                                  field.onChange(newValue)
                                }}
                                onError={(msg) => toast.error(msg)}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={adminFormFieldLabelClass}>
                            Category
                          </FormLabel>
                          <FormControl>
                            <div className="mt-2">
                              <CatalogCreatablePicker
                                value={field.value}
                                onChange={field.onChange}
                                options={categoryCatalog.map((c) => c.id)}
                                className="w-full"
                                triggerClassName={classificationSelectClass}
                                formatOption={(categoryId) =>
                                  findCategoryById(categoryCatalog, categoryId)
                                    ?.name ?? categoryId
                                }
                                placeholder="Choose a product category"
                                createPlaceholder="New category name (e.g. Monitor)"
                                createButtonLabel="Add category"
                                onCreate={async (raw) => {
                                  try {
                                    const category = await createCategory(raw)
                                    setCategoryCatalog((prev) => {
                                      if (
                                        prev.some((c) => c.id === category.id)
                                      ) {
                                        return prev
                                      }
                                      return [...prev, category]
                                    })
                                    field.onChange(category.id)
                                  } catch (error) {
                                    toast.error(getProductApiError(error))
                                  }
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AdminFormCard>

                  <div ref={variantsSectionRef}>
                    <ProductVariantsSection
                      control={form.control}
                      fields={fields}
                      optionAxes={watchOptionAxes}
                      optionCatalog={optionCatalog}
                      onOptionAxesChange={handleOptionAxesChange}
                      onCatalogChange={setOptionCatalog}
                      optionAxesError={
                        typeof form.formState.errors.optionAxes?.message ===
                        "string"
                          ? form.formState.errors.optionAxes.message
                          : null
                      }
                      variantsError={
                        typeof form.formState.errors.variants?.message ===
                        "string"
                          ? form.formState.errors.variants.message
                          : null
                      }
                      onAddVariant={handleAddSku}
                      onRemoveVariant={handleRemoveSku}
                      onSkuImageChange={trackSkuImage}
                    />
                  </div>
                </>
              }
              sidebar={
                <ProductFormSidebar
                  control={form.control}
                  name={watchName}
                  slug={loadedSlug ?? ""}
                  categoryId={watchCategoryId}
                  categoryCatalog={categoryCatalog}
                  isActive={watchIsActive}
                  imgUrl={watchImgUrl}
                  skuCount={fields.length}
                  minPrice={skuStats.minPrice}
                  maxPrice={skuStats.maxPrice}
                  totalStock={skuStats.totalStock}
                />
              }
            />
          </form>
        </Form>
      </AdminFormShell>

      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              All unsaved changes will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDiscard}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  )
}
