import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAdminStore } from "~/stores/adminStore"
import type { SKU, SPU } from "~/types/admin/index"
import { ADMIN_BRANDS, ADMIN_CATEGORIES } from "~/mock/adminCatalog"
import {
  alignSkuOptionsToAxes,
  computeProductStats,
  DEFAULT_OPTION_AXES,
  deriveOptionAxes,
  slugify,
  validateOptionAxes,
  validateSkuForms,
} from "~/lib/admin/productUtils"
import { SpuOptionAxesEditor } from "~/components/admin/SpuOptionAxesEditor"
import {
  cloneDefaultOptionCatalog,
  mergeProductIntoOptionCatalog,
} from "~/lib/admin/optionCatalog"
import {
  SkuFormCard,
  createDefaultSkuForm,
  type SkuFormData,
} from "~/components/admin/SkuFormCard"
import { ProductFormStepper } from "~/components/admin/ProductFormStepper"
import { ProductFormSummary } from "~/components/admin/ProductFormSummary"
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
import { Plus, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { AdminPage } from "~/components/admin/AdminPage"
import { AdminPageHeader } from "~/components/admin/AdminPageHeader"
import { ImageUploadField } from "~/components/admin/ImageUploadField"
import { adminBrandButtonClass } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"

const spuSchema = z.object({
  name: z.string().min(3, "Tên SPU phải có ít nhất 3 ký tự"),
  slug: z
    .string()
    .min(3, "Slug phải có ít nhất 3 ký tự")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  brand: z.string().min(1, "Vui lòng chọn thương hiệu"),
  imgUrl: z.union([
    z.literal(""),
    z
      .string()
      .refine(
        (val) =>
          val.startsWith("data:image/") ||
          /^https?:\/\/.+/i.test(val),
        "Ảnh không hợp lệ"
      ),
  ]),
  isActive: z.boolean(),
})

type SpuFormData = z.infer<typeof spuSchema>
type FormStep = "spu" | "skus"

const mapSkuToForm = (sku: SKU, optionAxes: string[]): SkuFormData => ({
  id: sku.id,
  sku: sku.sku,
  price: sku.price,
  stockQuantity: sku.stockQuantity,
  imgUrl: sku.imgUrl ?? "",
  options: alignSkuOptionsToAxes(optionAxes, sku.options),
})

export function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { products, addProduct, updateProduct } = useAdminStore()
  const [optionCatalog, setOptionCatalog] = useState(cloneDefaultOptionCatalog)
  const [optionAxes, setOptionAxes] = useState<string[]>([
    ...DEFAULT_OPTION_AXES,
  ])
  const [skus, setSkus] = useState<SkuFormData[]>(() => [
    createDefaultSkuForm([...DEFAULT_OPTION_AXES]),
  ])
  const [activeStep, setActiveStep] = useState<FormStep>("spu")
  const [openSkuPanels, setOpenSkuPanels] = useState<string[]>(["sku-0"])
  const [slugTouched, setSlugTouched] = useState(false)
  const isEditMode = !!id

  const form = useForm<SpuFormData>({
    resolver: zodResolver(spuSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      categoryId: "",
      brand: "",
      imgUrl: "",
      isActive: true,
    },
  })

  const watchName = form.watch("name")
  const watchSlug = form.watch("slug")
  const watchCategoryId = form.watch("categoryId")
  const watchBrand = form.watch("brand")
  const watchImgUrl = form.watch("imgUrl")
  const watchIsActive = form.watch("isActive")

  const skuStats = useMemo(() => {
    const prices = skus.map((s) => s.price).filter((p) => p > 0)
    const minPrice = prices.length ? Math.min(...prices) : 0
    const maxPrice = prices.length ? Math.max(...prices) : 0
    const totalStock = skus.reduce((sum, s) => sum + (s.stockQuantity || 0), 0)
    return { minPrice, maxPrice, totalStock }
  }, [skus])

  const productId = id ?? null
  const existingProduct = productId
    ? products.find((p) => p.id === productId)
    : undefined
  const canSaveSkus = Boolean(productId)

  useEffect(() => {
    if (!slugTouched && watchName && !isEditMode) {
      form.setValue("slug", slugify(watchName))
    }
  }, [watchName, slugTouched, isEditMode, form])

  useEffect(() => {
    if (!isEditMode || !id) return
    const product = products.find((p) => p.id === id)
    if (!product) return

    form.reset({
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: product.categoryId,
      brand: product.brand,
      imgUrl: product.imgUrl ?? "",
      isActive: product.isActive,
    })
    const axes = deriveOptionAxes(product)
    setOptionCatalog(mergeProductIntoOptionCatalog(cloneDefaultOptionCatalog(), product))
    setOptionAxes(axes)
    setSlugTouched(true)
    const mapped =
      product.skus.length > 0
        ? product.skus.map((s) => mapSkuToForm(s, axes))
        : [createDefaultSkuForm(axes)]
    setSkus(mapped)
    setOpenSkuPanels(mapped.map((_, i) => `sku-${i}`))
  }, [isEditMode, id, products, form])

  const handleOptionAxesChange = (axes: string[]) => {
    setOptionAxes(axes)
    setSkus((prev) =>
      prev.map((s) => ({
        ...s,
        options: alignSkuOptionsToAxes(axes, s.options),
      }))
    )
  }

  const handleAddSku = () => {
    const newIndex = skus.length
    setSkus((prev) => [...prev, createDefaultSkuForm(optionAxes)])
    setOpenSkuPanels((prev) => [...prev, `sku-${newIndex}`])
  }

  const handleRemoveSku = (index: number) => {
    if (skus.length <= 1) {
      toast.error("SPU cần ít nhất 1 SKU")
      return
    }
    setSkus((prev) => prev.filter((_, i) => i !== index))
    setOpenSkuPanels((prev) =>
      prev
        .filter((id) => id !== `sku-${index}`)
        .map((id) => {
          const n = Number(id.replace("sku-", ""))
          return n > index ? `sku-${n - 1}` : id
        })
    )
  }

  const handleSkuChange = (index: number, data: SkuFormData) => {
    setSkus((prev) => prev.map((s, i) => (i === index ? data : s)))
  }

  const buildSkusFromForm = (targetProductId: string): SKU[] => {
    const now = new Date().toISOString()
    return skus.map((row, index) => ({
      id: row.id ?? `sku-${Date.now()}-${index}`,
      productId: targetProductId,
      sku: row.sku.trim(),
      price: row.price,
      imgUrl: row.imgUrl?.trim() || undefined,
      stockQuantity: row.stockQuantity,
      options: alignSkuOptionsToAxes(optionAxes, row.options).filter((o) =>
        o.value.trim()
      ),
      createdAt: existingProduct?.skus[index]?.createdAt ?? now,
      updatedAt: now,
    }))
  }

  const handleSaveSpu = async () => {
    const valid = await form.trigger()
    if (!valid) return

    const axesError = validateOptionAxes(optionAxes)
    if (axesError) {
      toast.error(axesError)
      return
    }

    const data = form.getValues()
    const category = ADMIN_CATEGORIES.find((c) => c.id === data.categoryId)
    const now = new Date().toISOString()
    const newId = productId ?? `spu-${Date.now()}`
    const builtSkus = buildSkusFromForm(newId)

    const spuPayload: SPU = {
      id: newId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      categoryName: category?.name ?? "",
      brand: data.brand,
      optionAxes: [...optionAxes],
      imgUrl: data.imgUrl?.trim() || undefined,
      isActive: data.isActive,
      skus: existingProduct?.skus ?? builtSkus,
      createdAt: existingProduct?.createdAt ?? now,
      updatedAt: now,
      ...computeProductStats(existingProduct?.skus ?? builtSkus),
    }

    if (productId) {
      updateProduct(productId, {
        name: spuPayload.name,
        slug: spuPayload.slug,
        description: spuPayload.description,
        categoryId: spuPayload.categoryId,
        categoryName: spuPayload.categoryName,
        brand: spuPayload.brand,
        optionAxes: spuPayload.optionAxes,
        imgUrl: spuPayload.imgUrl,
        isActive: spuPayload.isActive,
      })
      toast.success("Đã lưu thông tin SPU")
      return
    }

    addProduct(spuPayload)
    toast.success("Đã tạo SPU")
    navigate(`/admin/products/edit/${newId}`, { replace: true })
  }

  const handleSaveSkus = () => {
    if (!productId) {
      toast.error("Lưu SPU trước để có thể lưu SKU")
      setActiveStep("spu")
      return
    }

    const skuPayload = skus.map((s) => ({
      sku: s.sku.trim(),
      price: s.price,
      stockQuantity: s.stockQuantity,
      imgUrl: s.imgUrl?.trim() || undefined,
      options: alignSkuOptionsToAxes(optionAxes, s.options).filter(
        (o) => o.value.trim()
      ),
    }))

    const otherSkuCodes = products
      .filter((p) => p.id !== productId)
      .flatMap((p) => p.skus.map((s) => s.sku))

    const skuError = validateSkuForms(
      skuPayload,
      optionAxes,
      optionCatalog,
      otherSkuCodes
    )
    if (skuError) {
      toast.error(skuError)
      return
    }

    const builtSkus = buildSkusFromForm(productId)
    const stats = computeProductStats(builtSkus)

    updateProduct(productId, {
      skus: builtSkus,
      ...stats,
    })
    toast.success("Đã lưu các SKU")
  }

  const summaryProps = {
    name: watchName,
    slug: watchSlug,
    categoryId: watchCategoryId,
    brand: watchBrand,
    isActive: watchIsActive,
    imgUrl: watchImgUrl,
    optionAxes,
    optionCatalog,
    skuCount: skus.length,
    minPrice: skuStats.minPrice,
    maxPrice: skuStats.maxPrice,
    totalStock: skuStats.totalStock,
  }

  return (
    <AdminPage className="gap-6">
      <AdminPageHeader
        title={isEditMode ? "Chỉnh sửa SPU / SKU" : "Tạo SPU & SKU"}
        description="SPU và SKU lưu độc lập. Chuyển tab tự do, không cần hoàn thành bước trước."
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
        skuCount={skus.length}
        onStepClick={setActiveStep}
      />

      <ProductFormSummary {...summaryProps} className="lg:hidden" />

      <Form {...form}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-8">
          <div className="min-w-0 space-y-6">
            {activeStep === "spu" ? (
              <div className="space-y-8 rounded-xl border border-border bg-card p-5 sm:p-6">
                <section className="space-y-4">
                  <div>
                    <h2 className="font-heading text-sm font-semibold text-foreground">
                      Định danh sản phẩm
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tên hiển thị và đường dẫn URL trên cửa hàng
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
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (URL) *</FormLabel>
                        <FormControl>
                          <div className="flex rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring/30">
                            <span className="flex items-center px-3 text-sm text-muted-foreground">
                              /
                            </span>
                            <Input
                              placeholder="iphone-15"
                              className="border-0 shadow-none focus-visible:ring-0"
                              {...field}
                              onChange={(e) => {
                                setSlugTouched(true)
                                field.onChange(e)
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Tự sinh từ tên nếu chưa chỉnh. Phải unique trong DB.
                        </FormDescription>
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn danh mục" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ADMIN_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select onValueChange={field.onChange} value={field.value}>
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
                  <SpuOptionAxesEditor
                    axes={optionAxes}
                    onChange={handleOptionAxesChange}
                    optionCatalog={optionCatalog}
                    onCatalogChange={setOptionCatalog}
                  />
                </section>

                <Separator />

                <section className="space-y-4">
                  <div>
                    <h2 className="font-heading text-sm font-semibold text-foreground">
                      Media & trạng thái
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ảnh đại diện SPU và quyết định hiển thị trên storefront
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="imgUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUploadField
                            label="Ảnh đại diện SPU"
                            description="Ảnh riêng có thể đặt ở từng SKU ở bước sau"
                            value={field.value}
                            onChange={field.onChange}
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
                {!canSaveSkus ? (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
                    Chưa có SPU trên hệ thống. Lưu tab SPU trước để có thể lưu SKU.
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-sm font-semibold text-foreground">
                      Biến thể SKU
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {watchSlug ? (
                        <>
                          Slug:{" "}
                          <span className="font-mono text-foreground">
                            /{watchSlug}
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

                {skus.length === 1 ? (
                  <SkuFormCard
                    index={0}
                    data={skus[0]}
                    optionAxes={optionAxes}
                    optionCatalog={optionCatalog}
                    onCatalogChange={setOptionCatalog}
                    productSlug={watchSlug || slugify(watchName || "product")}
                    canRemove={false}
                    onChange={(data) => handleSkuChange(0, data)}
                    onRemove={() => handleRemoveSku(0)}
                  />
                ) : (
                  <Accordion
                    type="multiple"
                    value={openSkuPanels}
                    onValueChange={setOpenSkuPanels}
                    className="space-y-3"
                  >
                    {skus.map((sku, index) => (
                      <AccordionItem
                        key={sku.id ?? `new-${index}`}
                        value={`sku-${index}`}
                        className="overflow-hidden rounded-xl border border-border bg-card px-0 last:border-b"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
                          <span className="flex flex-col items-start gap-0.5 text-left">
                            <span className="text-sm font-medium">
                              SKU #{index + 1}
                              {sku.sku ? (
                                <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                                  {sku.sku}
                                </span>
                              ) : null}
                            </span>
                            <span className="text-xs font-normal text-muted-foreground">
                              {sku.price > 0
                                ? `${sku.price.toLocaleString("vi-VN")}đ`
                                : "Chưa nhập giá"}
                            </span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-0">
                          <SkuFormCard
                            index={index}
                            data={sku}
                            optionAxes={optionAxes}
                            optionCatalog={optionCatalog}
                            onCatalogChange={setOptionCatalog}
                            productSlug={
                              watchSlug || slugify(watchName || "product")
                            }
                            canRemove={skus.length > 1}
                            onChange={(data) => handleSkuChange(index, data)}
                            onRemove={() => handleRemoveSku(index)}
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
              <Button
                type="button"
                className={cn(adminBrandButtonClass)}
                onClick={activeStep === "spu" ? handleSaveSpu : handleSaveSkus}
                disabled={activeStep === "skus" && !canSaveSkus}
              >
                {activeStep === "spu"
                  ? productId
                    ? "Lưu SPU"
                    : "Tạo SPU"
                  : "Lưu SKU"}
              </Button>
            </div>
          </div>

          <ProductFormSummary {...summaryProps} className="hidden lg:block" />
        </div>
      </Form>
    </AdminPage>
  )
}
