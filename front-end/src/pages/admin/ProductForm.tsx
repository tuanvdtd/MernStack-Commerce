import { useEffect, useState } from "react"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Switch } from "~/components/ui/switch"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Plus, ArrowLeft, Package, Layers } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("spu")
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
    setSkus(
      product.skus.length > 0
        ? product.skus.map((s) => mapSkuToForm(s, axes))
        : [createDefaultSkuForm(axes)]
    )
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
    setSkus((prev) => [...prev, createDefaultSkuForm(optionAxes)])
  }

  const handleRemoveSku = (index: number) => {
    if (skus.length <= 1) {
      toast.error("SPU cần ít nhất 1 SKU")
      return
    }
    setSkus((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSkuChange = (index: number, data: SkuFormData) => {
    setSkus((prev) => prev.map((s, i) => (i === index ? data : s)))
  }

  const handleContinueToSkus = async () => {
    const valid = await form.trigger()
    if (!valid) {
      setActiveTab("spu")
      return
    }
    const axesError = validateOptionAxes(optionAxes)
    if (axesError) {
      toast.error(axesError)
      setActiveTab("spu")
      return
    }
    setActiveTab("skus")
  }

  const onSubmit = (data: SpuFormData) => {
    const category = ADMIN_CATEGORIES.find((c) => c.id === data.categoryId)
    const axesError = validateOptionAxes(optionAxes)
    if (axesError) {
      toast.error(axesError)
      setActiveTab("spu")
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
      .filter((p) => p.id !== id)
      .flatMap((p) => p.skus.map((s) => s.sku))

    const skuError = validateSkuForms(
      skuPayload,
      optionAxes,
      optionCatalog,
      otherSkuCodes
    )
    if (skuError) {
      toast.error(skuError)
      setActiveTab("skus")
      return
    }

    const productId = isEditMode && id ? id : `spu-${Date.now()}`
    const now = new Date().toISOString()
    const existing = products.find((p) => p.id === productId)

    const builtSkus: SKU[] = skuPayload.map((row, index) => ({
      id: skus[index].id ?? `sku-${Date.now()}-${index}`,
      productId,
      sku: row.sku,
      price: row.price,
      imgUrl: row.imgUrl,
      stockQuantity: row.stockQuantity,
      options: row.options,
      createdAt: existing?.skus[index]?.createdAt ?? now,
      updatedAt: now,
    }))

    const stats = computeProductStats(builtSkus)

    const productData: SPU = {
      id: productId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      categoryName: category?.name ?? "",
      brand: data.brand,
      optionAxes: [...optionAxes],
      imgUrl: data.imgUrl?.trim() || undefined,
      isActive: data.isActive,
      skus: builtSkus,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...stats,
    }

    if (isEditMode && id) {
      updateProduct(id, productData)
      toast.success("Đã cập nhật SPU và các SKU")
    } else {
      addProduct(productData)
      toast.success("Đã tạo SPU và các SKU")
    }

    navigate("/admin/products")
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={isEditMode ? "Chỉnh sửa SPU / SKU" : "Tạo SPU & SKU"}
        description="Bước 1: SPU + trục Option → Bước 2: SKU (chọn giá trị từng trục)"
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
            <TabsList className="grid h-10 w-full max-w-sm grid-cols-2">
              <TabsTrigger value="spu" className="gap-2">
                <Package className="size-4" aria-hidden />
                SPU
              </TabsTrigger>
              <TabsTrigger value="skus" className="gap-2">
                <Layers className="size-4" aria-hidden />
                SKU ({skus.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="spu" className="mt-0 flex flex-col gap-6">
              <Card className="shadow-none">
                <CardHeader className="border-b">
                  <CardTitle>Thông tin SPU</CardTitle>
                  <CardDescription>
                    Tên, slug, danh mục, trục biến thể và ảnh đại diện
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
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
                          <Input
                            placeholder="iphone-15"
                            {...field}
                            onChange={(e) => {
                              setSlugTouched(true)
                              field.onChange(e)
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Tự sinh từ tên nếu chưa chỉnh — phải unique trong DB
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
                            placeholder="Mô tả chi tiết..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Danh mục (categoryId) *</FormLabel>
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

                  <SpuOptionAxesEditor
                    axes={optionAxes}
                    onChange={handleOptionAxesChange}
                    optionCatalog={optionCatalog}
                    onCatalogChange={setOptionCatalog}
                  />

                  <FormField
                    control={form.control}
                    name="imgUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUploadField
                            label="Ảnh đại diện SPU"
                            description="Chọn từ máy tính/điện thoại — ảnh riêng có thể đặt ở từng SKU"
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
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div>
                          <FormLabel>Đang bán (isActive)</FormLabel>
                          <FormDescription>
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
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="button"
                  className={adminBrandButtonClass}
                  onClick={handleContinueToSkus}
                >
                  Tiếp theo: thêm SKU
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="skus" className="mt-0">
              <Card className="shadow-none">
                <CardHeader className="border-b">
                  <CardTitle>Biến thể SKU</CardTitle>
                  <CardDescription>
                    {watchSlug ? (
                      <>
                        Slug:{" "}
                        <span className="font-mono text-foreground">{watchSlug}</span>
                      </>
                    ) : (
                      "Mã, giá, tồn kho và giá trị theo trục SPU"
                    )}
                  </CardDescription>
                  <CardAction>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSku}
                    >
                      <Plus className="size-4" aria-hidden />
                      Thêm SKU
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {skus.map((sku, index) => (
                    <SkuFormCard
                      key={sku.id ?? `new-${index}`}
                      index={index}
                      data={sku}
                      optionAxes={optionAxes}
                      optionCatalog={optionCatalog}
                      onCatalogChange={setOptionCatalog}
                      productSlug={watchSlug || slugify(watchName || "product")}
                      canRemove={skus.length > 1}
                      onChange={(data) => handleSkuChange(index, data)}
                      onRemove={() => handleRemoveSku(index)}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
            >
              Hủy
            </Button>
            {activeTab === "spu" ? (
              <Button
                type="button"
                className={adminBrandButtonClass}
                onClick={handleContinueToSkus}
              >
                Tiếp theo
              </Button>
            ) : (
              <Button type="submit" className={cn(adminBrandButtonClass)}>
                {isEditMode ? "Lưu SPU & SKU" : "Tạo SPU & SKU"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </AdminPage>
  )
}
