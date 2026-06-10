import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAdminStore } from "~/stores/adminStore"
import type { SPU } from "~/types/admin/index"
import { ADMIN_BRANDS } from "~/mock/adminCatalog"
import { findCategoryById } from "~/lib/admin/categoryCatalog"
import { createCategory, fetchCategories } from "~/apis/categoryApi"
import { fetchOptionCatalog } from "~/apis/optionApi"
import {
  createProduct,
  getProductApiError,
  fetchProductById,
  updateProduct as updateProductApi,
  type CreateProductPayload,
  type ProductImageFiles,
} from "~/apis/productApi"
import { CatalogCreatablePicker } from "~/components/admin/CatalogCreatablePicker"
import { deriveOptionAxes } from "~/lib/admin/productUtils"
import { SpuOptionAxesEditor } from "~/components/admin/SpuOptionAxesEditor"
import type { OptionCatalogEntry } from "~/lib/admin/optionCatalog"
import { SkuFormCard } from "~/components/admin/SkuFormCard"
import { ProductFormStepper } from "~/components/admin/ProductFormStepper"
import { ProductFormSummary } from "~/components/admin/ProductFormSummary"
import {
  createDefaultVariant,
  defaultProductFormValues,
  productFormSchema,
  type ProductFormValues,
} from "~/lib/admin/productFormSchema"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Switch } from "~/components/ui/switch"
import { Separator } from "~/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import { Plus, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { AdminPage } from "~/components/admin/AdminPage"
import { AdminPageHeader } from "~/components/admin/AdminPageHeader"
import {
  ImageUploadField,
  type ImageUploadChangeMeta,
} from "~/components/admin/ImageUploadField"
import { adminBrandButtonClass } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"
import type { AdminCategory } from "~/types/admin/index"

type FormStep = "spu" | "skus"

const SPU_FIELDS = [
  "name",
  "description",
  "categoryId",
  "brand",
  "imgUrl",
  "isActive",
  "optionAxes",
] as const satisfies ReadonlyArray<keyof ProductFormValues>

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
            sku: sku.sku,
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

const isSameOptionAxes = (a: string[], b: string[]) =>
  a.length === b.length && a.every((axis, index) => axis === b[index])

const mapFormToPayload = (values: ProductFormValues): CreateProductPayload => ({
  name: values.name.trim(),
  description: values.description.trim(),
  categoryId: values.categoryId,
  brand: values.brand,
  imgUrl: isRemoteImageUrl(values.imgUrl) ? values.imgUrl.trim() : "",
  isActive: values.isActive,
  optionAxes: values.optionAxes,
  variants: values.variants.map((variant) => ({
    sku: variant.sku.trim(),
    price: variant.price,
    stockQuantity: variant.stockQuantity,
    ...(isRemoteImageUrl(variant.imgUrl)
      ? { imgUrl: variant.imgUrl!.trim() }
      : {}),
    options: variant.options.map((option) => ({
      optionName: option.optionName,
      value: option.value.trim(),
    })),
  })),
})

export function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addProduct, updateProduct } = useAdminStore()
  const [categoryCatalog, setCategoryCatalog] = useState<AdminCategory[]>([])
  const [optionCatalog, setOptionCatalog] = useState<OptionCatalogEntry[]>([])
  const [activeStep, setActiveStep] = useState<FormStep>("spu")
  const [openSkuPanels, setOpenSkuPanels] = useState<string[]>(["sku-0"])
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(id))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [spuSaveDialogOpen, setSpuSaveDialogOpen] = useState(false)
  const isEditMode = Boolean(id)
  const pendingImagesRef = useRef<{ spu?: File; skus: Record<number, File> }>({
    skus: {},
  })
  const saveClickGuardRef = useRef(false)
  const committedFormRef = useRef<ProductFormValues | null>(null)

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
  const watchBrand = form.watch("brand")
  const watchImgUrl = form.watch("imgUrl")
  const watchIsActive = form.watch("isActive")
  const watchOptionAxes = form.watch("optionAxes")
  const watchVariants = form.watch("variants")

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
        setOpenSkuPanels(
          product.skus.length > 0
            ? product.skus.map((_, i) => `sku-${i}`)
            : ["sku-0"]
        )
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
    setOpenSkuPanels((prev) => [...prev, `sku-${fields.length}`])
  }

  const handleRemoveSku = (index: number) => {
    if (fields.length <= 1) {
      toast.error("SPU cần ít nhất 1 SKU")
      return
    }
    remove(index)
    setOpenSkuPanels((prev) =>
      prev
        .filter((panelId) => panelId !== `sku-${index}`)
        .map((panelId) => {
          const n = Number(panelId.replace("sku-", ""))
          return n > index ? `sku-${n - 1}` : panelId
        })
    )
  }

  const focusSkuPanelsWithErrors = () => {
    const variantErrors = form.formState.errors.variants
    if (!variantErrors || !Array.isArray(variantErrors)) return

    const panels = variantErrors
      .map((row, i) => (row ? `sku-${i}` : null))
      .filter((panelId): panelId is string => panelId !== null)

    if (panels.length > 0) {
      setOpenSkuPanels((prev) => [...new Set([...prev, ...panels])])
    }
  }

  const isSpuDirty = () => {
    if (pendingImagesRef.current.spu) return true

    const baseline = committedFormRef.current
    if (!baseline) return false

    const current = form.getValues()
    return (
      current.name !== baseline.name ||
      current.description !== baseline.description ||
      current.categoryId !== baseline.categoryId ||
      current.brand !== baseline.brand ||
      current.imgUrl !== baseline.imgUrl ||
      current.isActive !== baseline.isActive ||
      !isSameOptionAxes(current.optionAxes, baseline.optionAxes)
    )
  }

  const revertSpuChanges = () => {
    const baseline = committedFormRef.current
    if (!baseline) return

    const current = form.getValues()
    const axesChanged = !isSameOptionAxes(current.optionAxes, baseline.optionAxes)
    const variants = current.variants.map((variant, index) => {
      if (!axesChanged) return variant
      const baseVariant = baseline.variants[index]
      if (!baseVariant) return variant
      return { ...variant, options: baseVariant.options.map((o) => ({ ...o })) }
    })

    form.reset(
      {
        ...current,
        name: baseline.name,
        description: baseline.description,
        categoryId: baseline.categoryId,
        brand: baseline.brand,
        imgUrl: baseline.imgUrl,
        isActive: baseline.isActive,
        optionAxes: [...baseline.optionAxes],
        variants,
      },
      { keepDirty: false },
    )

    delete pendingImagesRef.current.spu
  }

  const goToSkuStep = () => {
    // Chặn ghost click: Tiếp và Lưu cùng vị trí, re-render có thể kích submit nhầm
    saveClickGuardRef.current = true
    setActiveStep("skus")
    window.setTimeout(() => {
      saveClickGuardRef.current = false
    }, 400)
  }

  const requestNavigateToSkus = async () => {
    const valid = await form.trigger([...SPU_FIELDS])
    if (!valid) return

    if (isEditMode && isSpuDirty()) {
      setSpuSaveDialogOpen(true)
      return
    }

    goToSkuStep()
  }

  const handleStepClick = (step: FormStep) => {
    if (step === "skus" && activeStep === "spu") {
      void requestNavigateToSkus()
      return
    }
    setActiveStep(step)
  }

  const continueToSkusWithoutSaving = () => {
    revertSpuChanges()
    setSpuSaveDialogOpen(false)
    goToSkuStep()
  }

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

  const persistProduct = async (values: ProductFormValues) => {
    const payload = mapFormToPayload(values)
    const imageFiles = collectPendingImageFiles()

    if (id) {
      const product = await updateProductApi(id, payload, imageFiles)
      updateProduct(id, product)
      pendingImagesRef.current = { skus: {} }
      const formValues = mapSpuToFormValues(product)
      form.reset(formValues)
      committedFormRef.current = cloneFormValues(formValues)
      setLoadedSlug(product.slug)
      return product
    }

    const product = await createProduct(payload, imageFiles)
    addProduct(product)
    pendingImagesRef.current = { skus: {} }
    navigate(`/admin/products/edit/${product.id}`, { replace: true })
    return product
  }

  const saveSpuAndContinue = async () => {
    const valid = await form.trigger([...SPU_FIELDS])
    if (!valid) {
      setSpuSaveDialogOpen(false)
      return
    }

    setIsSubmitting(true)
    try {
      await persistProduct(form.getValues())
      toast.success("Đã lưu thay đổi SPU")
      setSpuSaveDialogOpen(false)
      goToSkuStep()
    } catch (error) {
      toast.error(getProductApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveProduct = form.handleSubmit(
    async (values) => {
      setIsSubmitting(true)
      try {
        await persistProduct(values)
        toast.success(id ? "Đã lưu sản phẩm" : "Đã tạo sản phẩm")
      } catch (error) {
        toast.error(getProductApiError(error))
      } finally {
        setIsSubmitting(false)
      }
    },
    (errors) => {
      if (errors.variants) {
        focusSkuPanelsWithErrors()
        setActiveStep("skus")
        return
      }
      setActiveStep("spu")
    }
  )

  const summaryProps = {
    name: watchName,
    slug: loadedSlug ?? "",
    categoryId: watchCategoryId,
    categoryCatalog,
    brand: watchBrand,
    isActive: watchIsActive,
    imgUrl: watchImgUrl,
    optionAxes: watchOptionAxes,
    optionCatalog,
    skuCount: fields.length,
    minPrice: skuStats.minPrice,
    maxPrice: skuStats.maxPrice,
    totalStock: skuStats.totalStock,
  }

  if (isLoading) {
    return (
      <AdminPage className="items-center justify-center gap-3 py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Đang tải sản phẩm…</p>
      </AdminPage>
    )
  }

  return (
    <AdminPage className="gap-6">
      <AdminPageHeader
        title={isEditMode ? "Chỉnh sửa SPU / SKU" : "Tạo SPU & SKU"}
        description="Hoàn thành thông tin SPU, bấm Tiếp để tạo SKU. Slug URL do hệ thống tự sinh khi lưu."
        leading={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => navigate("/admin/products")}
            aria-label="Quay lại"
          >
            <ArrowLeft className="size-4" />
          </Button>
        }
      />

      <ProductFormStepper
        activeStep={activeStep}
        skuCount={fields.length}
        onStepClick={handleStepClick}
      />

      <ProductFormSummary {...summaryProps} className="lg:hidden" />

      <Form {...form}>
        <form
          onSubmit={handleSaveProduct}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-8"
        >
          <div className="min-w-0 space-y-6">
            {activeStep === "spu" ? (
              <div className="space-y-8 rounded-xl border border-border bg-card p-5 sm:p-6">
                <section className="space-y-4">
                  <div>
                    <h2 className="font-heading text-sm font-semibold text-foreground">
                      Định danh sản phẩm
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tên hiển thị trên cửa hàng. URL slug tự sinh khi lưu.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên sản phẩm *</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: iPhone 15" {...field} />
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
                        <FormLabel>Mô tả *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Mô tả chi tiết sản phẩm cho trang chi tiết..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <Separator />

                <section className="space-y-4">
                  <div>
                    <h2 className="font-heading text-sm font-semibold text-foreground">
                      Phân loại
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Danh mục và thương hiệu dùng cho lọc và SEO
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Danh mục *</FormLabel>
                          <FormControl>
                            <CatalogCreatablePicker
                              value={field.value}
                              onChange={field.onChange}
                              options={categoryCatalog.map((c) => c.id)}
                              formatOption={(categoryId) =>
                                findCategoryById(categoryCatalog, categoryId)
                                  ?.name ?? categoryId
                              }
                              placeholder="Chọn danh mục"
                              createPlaceholder="Tên danh mục mới (VD: Màn hình)"
                              createButtonLabel="Thêm danh mục"
                              onCreate={async (raw) => {
                                try {
                                  const category = await createCategory(raw)
                                  setCategoryCatalog((prev) => {
                                    if (prev.some((c) => c.id === category.id)) {
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
                          </FormControl>
                          <FormDescription>
                            Chọn từ danh sách hoặc thêm danh mục mới.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thương hiệu *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn thương hiệu" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ADMIN_BRANDS.map((brand) => (
                                <SelectItem key={brand} value={brand}>
                                  {brand}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator />

                <section>
                  <FormField
                    control={form.control}
                    name="optionAxes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SpuOptionAxesEditor
                            axes={field.value}
                            onChange={handleOptionAxesChange}
                            optionCatalog={optionCatalog}
                            onCatalogChange={setOptionCatalog}
                            error={
                              typeof form.formState.errors.optionAxes?.message ===
                              "string"
                                ? form.formState.errors.optionAxes.message
                                : null
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <Separator />

                <section className="space-y-4">
                  <div>
                    <h2 className="font-heading text-sm font-semibold text-foreground">
                      Media & trạng thái
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ảnh đại diện SPU bắt buộc. Ảnh SKU là tùy chọn.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="imgUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUploadField
                            label="Ảnh đại diện SPU *"
                            description="Bắt buộc để hiển thị trên storefront"
                            value={field.value}
                            onChange={(newValue, meta) => {
                              trackSpuImage(meta)
                              field.onChange(newValue)
                            }}
                            onError={(msg) => toast.error(msg)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/20 px-4 py-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Đang bán</FormLabel>
                          <FormDescription className="text-xs">
                            Tắt để ẩn toàn bộ SPU và SKU khỏi cửa hàng
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </section>
              </div>
            ) : (
              <div className="space-y-4">
                {typeof form.formState.errors.variants?.message === "string" ? (
                  <p
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                    role="alert"
                  >
                    {form.formState.errors.variants.message}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-sm font-semibold text-foreground">
                      Biến thể SKU
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {loadedSlug ? (
                        <>
                          Slug:{" "}
                          <span className="font-mono text-foreground">
                            /{loadedSlug}
                          </span>
                        </>
                      ) : (
                        "Mã, giá, tồn kho và giá trị theo từng trục Option"
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleAddSku}
                  >
                    <Plus className="size-4" aria-hidden />
                    Thêm SKU
                  </Button>
                </div>

                {fields.length === 1 ? (
                  <SkuFormCard
                    control={form.control}
                    index={0}
                    optionAxes={watchOptionAxes}
                    optionCatalog={optionCatalog}
                    onCatalogChange={setOptionCatalog}
                    productName={watchName}
                    canRemove={false}
                    onRemove={() => handleRemoveSku(0)}
                    onImageFieldChange={(meta) => trackSkuImage(0, meta)}
                  />
                ) : (
                  <Accordion
                    type="multiple"
                    value={openSkuPanels}
                    onValueChange={setOpenSkuPanels}
                    className="space-y-3"
                  >
                    {fields.map((field, index) => (
                      <AccordionItem
                        key={field.id}
                        value={`sku-${index}`}
                        className="overflow-hidden rounded-xl border border-border bg-card px-0 last:border-b"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
                          <span className="flex flex-col items-start gap-0.5 text-left">
                            <span className="text-sm font-medium">
                              SKU #{index + 1}
                              {watchVariants[index]?.sku ? (
                                <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                                  {watchVariants[index].sku}
                                </span>
                              ) : null}
                            </span>
                            <span className="text-xs font-normal text-muted-foreground">
                              {watchVariants[index]?.price > 0
                                ? `${watchVariants[index].price.toLocaleString("vi-VN")}đ`
                                : "Chưa nhập giá"}
                            </span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-0">
                          <SkuFormCard
                            control={form.control}
                            index={index}
                            optionAxes={watchOptionAxes}
                            optionCatalog={optionCatalog}
                            onCatalogChange={setOptionCatalog}
                            productName={watchName}
                            canRemove={fields.length > 1}
                            onRemove={() => handleRemoveSku(index)}
                            onImageFieldChange={(meta) =>
                              trackSkuImage(index, meta)
                            }
                            compact
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            )}

            <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => navigate("/admin/products")}
              >
                Đóng
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                {activeStep === "skus" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveStep("spu")}
                  >
                    Quay lại SPU
                  </Button>
                ) : null}
                {activeStep === "spu" ? (
                  <Button
                    type="button"
                    className={cn(adminBrandButtonClass, "gap-2")}
                    onClick={() => void requestNavigateToSkus()}
                  >
                    Tiếp
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className={cn(adminBrandButtonClass, "gap-2")}
                    disabled={isSubmitting}
                    onClick={() => {
                      if (saveClickGuardRef.current) return
                      void handleSaveProduct()
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : null}
                    {id ? "Lưu sản phẩm" : "Tạo sản phẩm"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <ProductFormSummary {...summaryProps} className="hidden lg:block" />
        </form>
      </Form>

      <AlertDialog open={spuSaveDialogOpen} onOpenChange={setSpuSaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lưu thay đổi SPU?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có thay đổi thông tin SPU chưa lưu. Lưu trước khi chuyển sang
              bước SKU? Chọn Bỏ qua sẽ hoàn tác các thay đổi SPU.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={continueToSkusWithoutSaving}
            >
              Bỏ qua
            </Button>
            <Button
              type="button"
              className={cn(adminBrandButtonClass, "gap-2")}
              disabled={isSubmitting}
              onClick={() => void saveSpuAndContinue()}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              Lưu và tiếp
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  )
}
