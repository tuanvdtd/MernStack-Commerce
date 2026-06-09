import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAdminStore } from "~/stores/adminStore"
import { mockProducts } from "~/mock/adminData"
import type { AdminDiscount } from "~/types/admin/index"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Switch } from "~/components/ui/switch"
import { Checkbox } from "~/components/ui/checkbox"
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
import { ArrowLeft, Package, Search } from "lucide-react"
import { toast } from "sonner"
import { AdminPage } from "~/components/admin/AdminPage"
import { AdminPageHeader } from "~/components/admin/AdminPageHeader"
import { DiscountStatusBadge } from "~/components/admin/DiscountStatusBadge"
import {
  adminBrandButtonClass,
  adminFilterInputClass,
  adminWorkspaceClass,
  formatVnd,
} from "~/lib/admin/ui"
import {
  DISCOUNT_APPLIES_TO_LABELS,
  DISCOUNT_TYPE_LABELS,
  formatDiscountValue,
  formatUsageRatio,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "~/lib/admin/discountUtils"
import { cn } from "~/lib/utils"

const discountSchema = z
  .object({
    name: z.string().min(3, "Tên phải có ít nhất 3 ký tự"),
    description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
    code: z
      .string()
      .min(3, "Mã phải có ít nhất 3 ký tự")
      .max(100, "Mã tối đa 100 ký tự")
      .regex(
        /^[A-Z0-9_-]+$/,
        "Mã chỉ gồm chữ in hoa, số, gạch dưới hoặc gạch ngang"
      ),
    type: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]),
    value: z.coerce.number().positive("Giá trị phải lớn hơn 0"),
    maxValue: z.coerce.number().min(0, "Giá trị tối đa không được âm"),
    minOrderValue: z.coerce.number().min(0, "Giá trị đơn tối thiểu không được âm"),
    maxUses: z.coerce.number().int().positive("Tổng lượt dùng phải lớn hơn 0"),
    maxUsesPerUser: z.coerce
      .number()
      .int()
      .positive("Lượt dùng mỗi user phải lớn hơn 0"),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    appliesTo: z.enum(["ALL", "SPECIFIC"]),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày kết thúc phải sau ngày bắt đầu",
        path: ["endDate"],
      })
    }
    if (data.type === "PERCENTAGE" && data.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phần trăm giảm không được vượt quá 100%",
        path: ["value"],
      })
    }
    if (data.type === "PERCENTAGE" && data.maxValue <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng nhập mức giảm tối đa (VND)",
        path: ["maxValue"],
      })
    }
    if (data.type === "FIXED_AMOUNT" && data.maxValue !== data.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Với giảm cố định, giá trị tối đa phải bằng giá trị giảm",
        path: ["maxValue"],
      })
    }
  })

type DiscountFormData = z.infer<typeof discountSchema>

const defaultStart = () => {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  return toDatetimeLocalValue(now.toISOString())
}

const defaultEnd = () => {
  const end = new Date()
  end.setMonth(end.getMonth() + 1)
  end.setMinutes(59, 0, 0)
  return toDatetimeLocalValue(end.toISOString())
}

export function DiscountForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { discounts, products, setProducts, addDiscount, updateDiscount } =
    useAdminStore()
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [productSearch, setProductSearch] = useState("")
  const isEditMode = !!id

  const existingDiscount = useMemo(
    () => discounts.find((d) => d.id === id),
    [discounts, id]
  )

  useEffect(() => {
    if (products.length === 0) setProducts(mockProducts)
  }, [products, setProducts])

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema) as Resolver<DiscountFormData>,
    defaultValues: {
      name: "",
      description: "",
      code: "",
      type: "PERCENTAGE",
      value: 10,
      maxValue: 100000,
      minOrderValue: 0,
      maxUses: 100,
      maxUsesPerUser: 1,
      startDate: defaultStart(),
      endDate: defaultEnd(),
      appliesTo: "ALL",
      isActive: true,
    },
  })

  const watchType = form.watch("type")
  const watchValue = form.watch("value")
  const watchAppliesTo = form.watch("appliesTo")
  const watchValues = form.watch()

  useEffect(() => {
    if (!isEditMode || !existingDiscount) return
    form.reset({
      name: existingDiscount.name,
      description: existingDiscount.description,
      code: existingDiscount.code,
      type: existingDiscount.type,
      value: existingDiscount.value,
      maxValue: existingDiscount.maxValue,
      minOrderValue: existingDiscount.minOrderValue,
      maxUses: existingDiscount.maxUses,
      maxUsesPerUser: existingDiscount.maxUsesPerUser,
      startDate: toDatetimeLocalValue(existingDiscount.startDate),
      endDate: toDatetimeLocalValue(existingDiscount.endDate),
      appliesTo: existingDiscount.appliesTo,
      isActive: existingDiscount.isActive,
    })
    setSelectedProductIds(existingDiscount.productIds)
  }, [isEditMode, existingDiscount, form])

  useEffect(() => {
    if (watchType !== "FIXED_AMOUNT") return
    form.setValue("maxValue", watchValue, { shouldValidate: true })
  }, [watchType, watchValue, form])

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase()
    return products.filter(
      (p) =>
        p.isActive &&
        (p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q))
    )
  }, [products, productSearch])

  const previewDiscount: AdminDiscount = {
    id: id ?? "preview",
    name: watchValues.name || "Tên mã giảm giá",
    description: watchValues.description || "",
    type: watchValues.type,
    value: Number(watchValues.value) || 0,
    maxValue: Number(watchValues.maxValue) || 0,
    code: watchValues.code || "MAGIAMGIA",
    startDate: watchValues.startDate
      ? fromDatetimeLocalValue(watchValues.startDate)
      : new Date().toISOString(),
    endDate: watchValues.endDate
      ? fromDatetimeLocalValue(watchValues.endDate)
      : new Date().toISOString(),
    maxUses: Number(watchValues.maxUses) || 0,
    usesCount: existingDiscount?.usesCount ?? 0,
    maxUsesPerUser: Number(watchValues.maxUsesPerUser) || 0,
    minOrderValue: Number(watchValues.minOrderValue) || 0,
    isActive: watchValues.isActive,
    appliesTo: watchValues.appliesTo,
    productIds: selectedProductIds,
    createdAt: existingDiscount?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const handleToggleProduct = (productId: string, checked: boolean) => {
    setSelectedProductIds((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    )
  }

  const handleSubmit = (data: DiscountFormData) => {
    if (data.appliesTo === "SPECIFIC" && selectedProductIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm")
      return
    }

    if (isEditMode && existingDiscount) {
      const duplicateCode = discounts.some(
        (d) => d.code === data.code && d.id !== existingDiscount.id
      )
      if (duplicateCode) {
        form.setError("code", { message: "Mã đã tồn tại" })
        return
      }

      updateDiscount(existingDiscount.id, {
        name: data.name,
        description: data.description,
        code: data.code,
        type: data.type,
        value: data.value,
        maxValue: data.type === "FIXED_AMOUNT" ? data.value : data.maxValue,
        minOrderValue: data.minOrderValue,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        startDate: fromDatetimeLocalValue(data.startDate),
        endDate: fromDatetimeLocalValue(data.endDate),
        appliesTo: data.appliesTo,
        isActive: data.isActive,
        productIds: data.appliesTo === "SPECIFIC" ? selectedProductIds : [],
      })
      toast.success("Đã cập nhật mã giảm giá")
      navigate("/admin/discounts")
      return
    }

    const duplicateCode = discounts.some((d) => d.code === data.code)
    if (duplicateCode) {
      form.setError("code", { message: "Mã đã tồn tại" })
      return
    }

    const newDiscount: AdminDiscount = {
      id: `disc-${Date.now()}`,
      name: data.name,
      description: data.description,
      code: data.code,
      type: data.type,
      value: data.value,
      maxValue: data.type === "FIXED_AMOUNT" ? data.value : data.maxValue,
      minOrderValue: data.minOrderValue,
      maxUses: data.maxUses,
      usesCount: 0,
      maxUsesPerUser: data.maxUsesPerUser,
      startDate: fromDatetimeLocalValue(data.startDate),
      endDate: fromDatetimeLocalValue(data.endDate),
      appliesTo: data.appliesTo,
      isActive: data.isActive,
      productIds: data.appliesTo === "SPECIFIC" ? selectedProductIds : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addDiscount(newDiscount)
    toast.success("Đã tạo mã giảm giá")
    navigate("/admin/discounts")
  }

  if (isEditMode && !existingDiscount) {
    return (
      <AdminPage>
        <AdminPageHeader
          title="Không tìm thấy mã"
          description="Mã giảm giá không tồn tại hoặc đã bị xóa."
          actions={
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => navigate("/admin/discounts")}
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.75} />
              Quay lại
            </Button>
          }
        />
      </AdminPage>
    )
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={isEditMode ? "Sửa mã giảm giá" : "Tạo mã giảm giá"}
        description={
          isEditMode
            ? `Chỉnh sửa mã ${existingDiscount?.code}.`
            : "Thiết lập voucher, giới hạn lượt dùng và phạm vi áp dụng."
        }
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => navigate("/admin/discounts")}
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.75} />
            Quay lại
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className={cn(adminWorkspaceClass, "divide-y divide-border/60")}
          >
            <section className="space-y-5 px-5 py-5 lg:px-6">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">
                  Thông tin cơ bản
                </h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Tên hiển thị và mã khách nhập khi thanh toán.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Tên mã</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Giảm 10% đơn đầu"
                          className={adminFilterInputClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã voucher</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="WELCOME10"
                          className={cn("font-mono uppercase", adminFilterInputClass)}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Chỉ chữ in hoa, số, _ hoặc -
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-end">
                      <div className="flex w-full items-center justify-between rounded-xl border border-border/70 px-4 py-3">
                        <div>
                          <FormLabel className="mb-0">Kích hoạt</FormLabel>
                          <FormDescription className="mt-0.5">
                            Cho phép khách sử dụng mã
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả ngắn về điều kiện áp dụng..."
                          className="min-h-24 resize-y text-[13px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-5 px-5 py-5 lg:px-6">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">
                  Giá trị giảm
                </h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Cố định (VND) hoặc phần trăm với mức trần.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại giảm</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className={adminFilterInputClass}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">
                            {DISCOUNT_TYPE_LABELS.PERCENTAGE}
                          </SelectItem>
                          <SelectItem value="FIXED_AMOUNT">
                            {DISCOUNT_TYPE_LABELS.FIXED_AMOUNT}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {watchType === "PERCENTAGE"
                          ? "Phần trăm (%)"
                          : "Số tiền giảm (VND)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={watchType === "PERCENTAGE" ? 1 : 1000}
                          className={cn("font-mono", adminFilterInputClass)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchType === "PERCENTAGE" && (
                  <FormField
                    control={form.control}
                    name="maxValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giảm tối đa (VND)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1000}
                            className={cn("font-mono", adminFilterInputClass)}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Mức trần khi tính theo phần trăm
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="minOrderValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn tối thiểu (VND)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={10000}
                          className={cn("font-mono", adminFilterInputClass)}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>0 = không yêu cầu</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-5 px-5 py-5 lg:px-6">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">
                  Giới hạn sử dụng
                </h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Tổng lượt dùng toàn hệ thống và mỗi tài khoản.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tổng lượt dùng</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          className={cn("font-mono", adminFilterInputClass)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxUsesPerUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lượt / mỗi khách</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          className={cn("font-mono", adminFilterInputClass)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bắt đầu</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          className={adminFilterInputClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kết thúc</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          className={adminFilterInputClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-5 px-5 py-5 lg:px-6">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">
                  Phạm vi áp dụng
                </h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Toàn bộ đơn hàng hoặc danh sách SPU chỉ định.
                </p>
              </div>

              <FormField
                control={form.control}
                name="appliesTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Áp dụng cho</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger
                          className={cn("max-w-xs", adminFilterInputClass)}
                        >
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">
                          {DISCOUNT_APPLIES_TO_LABELS.ALL}
                        </SelectItem>
                        <SelectItem value="SPECIFIC">
                          {DISCOUNT_APPLIES_TO_LABELS.SPECIFIC}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchAppliesTo === "SPECIFIC" && (
                <div className="space-y-3 rounded-xl border border-border/70 p-4">
                  <div className="relative max-w-sm">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      strokeWidth={2}
                    />
                    <Input
                      placeholder="Tìm sản phẩm..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className={cn("pl-9", adminFilterInputClass)}
                    />
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Đã chọn {selectedProductIds.length} sản phẩm
                  </p>
                  <div className="max-h-64 space-y-1 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <p className="py-6 text-center text-[13px] text-muted-foreground">
                        Không có sản phẩm phù hợp
                      </p>
                    ) : (
                      filteredProducts.map((product) => {
                        const checked = selectedProductIds.includes(product.id)
                        return (
                          <label
                            key={product.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                              checked ? "bg-[var(--admin-brand)]/8" : "hover:bg-muted/60"
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                handleToggleProduct(product.id, value === true)
                              }
                              aria-label={`Chọn ${product.name}`}
                            />
                            {product.imgUrl ? (
                              <img
                                src={product.imgUrl}
                                alt=""
                                className="size-9 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                <Package
                                  className="size-3.5 text-muted-foreground"
                                  strokeWidth={1.75}
                                />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium">
                                {product.name}
                              </p>
                              <p className="truncate text-[12px] text-muted-foreground">
                                {product.brand} · {product.categoryName}
                              </p>
                            </div>
                          </label>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </section>

            <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-4 lg:px-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/discounts")}
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" className={adminBrandButtonClass}>
                {isEditMode ? "Lưu thay đổi" : "Tạo mã"}
              </Button>
            </div>
          </form>
        </Form>

        <aside
          className={cn(
            adminWorkspaceClass,
            "sticky top-[calc(3.25rem+1.5rem)] space-y-4 p-5 lg:p-6"
          )}
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Xem trước
            </p>
            <p className="mt-3 font-mono text-lg font-semibold tracking-wide text-[var(--admin-brand)]">
              {previewDiscount.code}
            </p>
            <p className="mt-1 text-[14px] font-medium">{previewDiscount.name}</p>
          </div>

          <Separator />

          <dl className="space-y-3 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Giá trị</dt>
              <dd className="font-mono font-medium text-right">
                {formatDiscountValue(previewDiscount)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Phạm vi</dt>
              <dd className="text-right">
                {DISCOUNT_APPLIES_TO_LABELS[previewDiscount.appliesTo]}
              </dd>
            </div>
            {previewDiscount.appliesTo === "SPECIFIC" && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Sản phẩm</dt>
                <dd className="font-mono text-right">
                  {selectedProductIds.length}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Đơn tối thiểu</dt>
              <dd className="font-mono text-right">
                {previewDiscount.minOrderValue > 0
                  ? formatVnd(previewDiscount.minOrderValue)
                  : "Không"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Lượt dùng</dt>
              <dd className="font-mono text-right">
                {formatUsageRatio(
                  previewDiscount.usesCount,
                  previewDiscount.maxUses
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Mỗi khách</dt>
              <dd className="font-mono text-right">
                {previewDiscount.maxUsesPerUser} lần
              </dd>
            </div>
          </dl>

          <Separator />

          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] text-muted-foreground">Trạng thái</span>
            <DiscountStatusBadge discount={previewDiscount} />
          </div>
        </aside>
      </div>
    </AdminPage>
  )
}
