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
  type UpdateProductVariantsPayload,
} from "~/apis/productApi"
import { useOrphanImageTracker } from "~/hooks/useOrphanImageTracker"
import { isFieldDirty } from "~/lib/admin/getDirtyValues"
import { CatalogCreatablePicker } from "~/components/admin/CatalogCreatablePicker"
import { AdminFormShell, AdminFormLayout } from "~/components/admin/AdminFormShell"
import { AdminFormCard } from "~/components/admin/AdminFormCard"
import { ProductFormSidebar } from "~/components/admin/ProductFormSidebar"
import { ProductPriceSection } from "~/components/admin/ProductPriceSection"
import { ProductVariantsSection } from "~/components/admin/ProductVariantsSection"
import type { OptionCatalogEntry } from "~/lib/admin/optionCatalog"
import {
  defaultProductFormValues,
  productFormSchema,
  type ProductFormValues,
} from "~/lib/admin/productFormSchema"
import {
  createSimpleProductVariant,
  deriveOptionDefinitions,
  hasVariantOptions,
} from "~/lib/admin/variantGeneration"
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
import { ProductGalleryField } from "~/components/admin/ProductGalleryField"
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

  const optionDefinitions = deriveOptionDefinitions(optionAxes, product.skus)
  const firstSku = product.skus[0]

  const images =
    product.images?.length > 0
      ? product.images.map((image, index) => ({
          url: image.url,
          publicId: image.publicId ?? `legacy:${image.url}`,
          sortOrder: image.sortOrder ?? index,
          alt: image.alt,
        }))
      : product.thumbnail
        ? [
            {
              url: product.thumbnail,
              publicId: `legacy:${product.thumbnail}`,
              sortOrder: 0,
            },
          ]
        : []

  const variants =
    product.skus.length > 0
      ? product.skus.map((sku) => ({
          id: sku.id,
          price: sku.price,
          stockQuantity: sku.stockQuantity,
          imgUrl: sku.imgUrl ?? "",
          options: hasVariantOptions(optionDefinitions)
            ? optionDefinitions.map((definition) => ({
                optionName: definition.name,
                value:
                  sku.options.find(
                    (option) => option.optionName === definition.name
                  )?.value ?? "",
              }))
            : [],
        }))
      : [createSimpleProductVariant(0, 0)]

  return {
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    brand: product.brand,
    images,
    isActive: product.isActive,
    basePrice: firstSku?.price ?? 0,
    baseStock: firstSku?.stockQuantity ?? 0,
    optionDefinitions,
    variants,
  }
}

const isRemoteImageUrl = (url: string | undefined) =>
  Boolean(url?.trim() && /^https?:\/\//i.test(url.trim()))

const cloneFormValues = (values: ProductFormValues): ProductFormValues => ({
  ...values,
  images: values.images.map((image) => ({ ...image })),
  optionDefinitions: values.optionDefinitions.map((definition) => ({
    ...definition,
    values: [...definition.values],
  })),
  variants: values.variants.map((variant) => ({
    ...variant,
    options: variant.options.map((option) => ({ ...option })),
  })),
})

const getOptionAxes = (values: ProductFormValues) =>
  values.optionDefinitions.map((definition) => definition.name)

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
  images: values.images.map((image, index) => ({
    url: image.url.trim(),
    publicId: image.publicId.trim(),
    sortOrder: index,
    ...(image.alt?.trim() ? { alt: image.alt.trim() } : {}),
  })),
  isActive: values.isActive,
  optionAxes: getOptionAxes(values),
  variants: values.variants.map(mapVariantToPayload),
})

/** Variant payload: gửi full danh sách để BE đồng bộ theo id. */
const mapFormToVariantsPayload = (
  values: ProductFormValues
): UpdateProductVariantsPayload => ({
  optionAxes: getOptionAxes(values),
  variants: values.variants.map(mapVariantToPayload),
})

/**
 * Build a PATCH SPU payload from React Hook Form dirtyFields.
 * Gallery gửi kèm JSON sau khi upload-first lên Cloudinary.
 */
const buildSpuPatchPayload = (
  values: ProductFormValues,
  dirtyFields: Record<string, unknown>
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
  if (
    isFieldDirty(dirtyFields, "optionDefinitions") ||
    isFieldDirty(dirtyFields, "basePrice") ||
    isFieldDirty(dirtyFields, "baseStock")
  ) {
    patch.optionAxes = getOptionAxes(values)
  }
  if (isFieldDirty(dirtyFields, "images")) {
    patch.images = values.images.map((image, index) => ({
      url: image.url.trim(),
      publicId: image.publicId.trim(),
      sortOrder: index,
      ...(image.alt?.trim() ? { alt: image.alt.trim() } : {}),
    }))
  }

  return patch
}

const collectCommittedImageUrls = (values: ProductFormValues) => [
  ...values.images.map((image) => image.url),
  ...values.variants.map((variant) => variant.imgUrl).filter(Boolean),
]

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
  const committedFormRef = useRef<ProductFormValues | null>(null)
  const variantsSectionRef = useRef<HTMLDivElement>(null)
  const [committedImageUrls, setCommittedImageUrls] = useState<string[]>([])
  const { onFieldChange, markAllCurrentAsCommitted, cleanupPending } =
    useOrphanImageTracker(committedImageUrls)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultProductFormValues(),
    mode: "onSubmit",
  })

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "variants",
  })

  const watchName = form.watch("name")
  const watchCategoryId = form.watch("categoryId")
  const watchImages = form.watch("images")
  const watchIsActive = form.watch("isActive")
  const watchOptionDefinitions = form.watch("optionDefinitions")
  const watchBasePrice = form.watch("basePrice")
  const watchBaseStock = form.watch("baseStock")
  const watchVariants = form.watch("variants")
  const { isDirty } = form.formState

  const showVariantOptions = hasVariantOptions(watchOptionDefinitions)

  const coverImageUrl = watchImages[0]?.url ?? ""
  const hasUnsavedChanges = isDirty

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
        setCommittedImageUrls(collectCommittedImageUrls(formValues))
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

  useEffect(() => {
    if (showVariantOptions) return

    const currentVariant = form.getValues("variants.0")
    if (!currentVariant) return

    form.setValue("variants.0.price", watchBasePrice, { shouldDirty: true })
    form.setValue("variants.0.stockQuantity", watchBaseStock, {
      shouldDirty: true,
    })
  }, [watchBasePrice, watchBaseStock, showVariantOptions, form])

  const handleOptionDefinitionsChange = (
    definitions: ProductFormValues["optionDefinitions"]
  ) => {
    form.setValue("optionDefinitions", definitions, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const handleVariantsReplace = (variants: ProductFormValues["variants"]) => {
    replace(variants)
    form.setValue("variants", variants, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  /** Sync store và reset form sau khi API trả SPU mới nhất. */
  const applySavedProduct = (product: SPU) => {
    updateProduct(product.id, product)
    const formValues = mapSpuToFormValues(product)
    form.reset(formValues)
    committedFormRef.current = cloneFormValues(formValues)
    markAllCurrentAsCommitted(collectCommittedImageUrls(formValues))
    setCommittedImageUrls(collectCommittedImageUrls(formValues))
    setLoadedSlug(product.slug)
    return product
  }

  /** Save step 1 edit: PATCH partial SPU. */
  const persistSpuPatch = async (values: ProductFormValues) => {
    if (!id) return

    const patch = buildSpuPatchPayload(values, form.formState.dirtyFields)
    if (Object.keys(patch).length === 0) return

    const product = await patchProductSpu(id, patch)
    return applySavedProduct(product)
  }

  /** Save step 2 edit: PUT all variants. */
  const persistVariants = async (values: ProductFormValues) => {
    if (!id) return

    const payload = mapFormToVariantsPayload(values)
    const product = await updateProductVariants(id, payload)
    return applySavedProduct(product)
  }

  /** Create mode: POST full SPU + SKUs. */
  const persistCreate = async (values: ProductFormValues) => {
    const payload = mapFormToPayload(values)
    const product = await createProduct(payload)
    addProduct(product)
    markAllCurrentAsCommitted(collectCommittedImageUrls(values))
    navigate(`/admin/products/edit/${product.id}`, { replace: true })
    return product
  }

  /** Revert form về snapshot đã lưu hoặc defaults (create). */
  const handleDiscard = () => {
    void cleanupPending()

    if (isEditMode && committedFormRef.current) {
      form.reset(cloneFormValues(committedFormRef.current))
      setCommittedImageUrls(
        collectCommittedImageUrls(committedFormRef.current)
      )
    } else {
      form.reset(defaultProductFormValues())
      setCommittedImageUrls([])
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
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={adminFormFieldLabelClass}>
                            Media
                          </FormLabel>
                          <FormControl>
                            <div className="mt-2">
                              <ProductGalleryField
                                label="Media"
                                hideLabel
                                value={field.value}
                                onChange={field.onChange}
                                onImageUploaded={(previousUrl, url, publicId) =>
                                  onFieldChange(previousUrl, url, publicId)
                                }
                                onImageRemoved={(url) =>
                                  onFieldChange(url, "")
                                }
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

                  <ProductPriceSection
                    control={form.control}
                    hidden={showVariantOptions}
                  />

                  <div ref={variantsSectionRef}>
                    <ProductVariantsSection
                      control={form.control}
                      fields={fields}
                      optionCatalog={optionCatalog}
                      onCatalogChange={setOptionCatalog}
                      optionDefinitions={watchOptionDefinitions}
                      onOptionDefinitionsChange={handleOptionDefinitionsChange}
                      onVariantsReplace={handleVariantsReplace}
                      optionDefinitionsError={
                        typeof form.formState.errors.optionDefinitions?.message ===
                        "string"
                          ? form.formState.errors.optionDefinitions.message
                          : null
                      }
                      variantsError={
                        typeof form.formState.errors.variants?.message ===
                        "string"
                          ? form.formState.errors.variants.message
                          : null
                      }
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
                  coverImageUrl={coverImageUrl}
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
