import * as z from "zod"

export const variantOptionSchema = z.object({
  optionName: z.string(),
  value: z.string().min(1, "Chọn giá trị cho thuộc tính này"),
})

export const variantSchema = z.object({
  id: z.string().optional(),
  sku: z
    .string()
    .min(1, "Mã SKU không được để trống")
    .min(3, "Mã SKU phải có ít nhất 3 ký tự"),
  price: z.number().min(1000, "Giá bán phải từ 1.000đ trở lên"),
  stockQuantity: z.number().min(0, "Tồn kho không được âm"),
  imgUrl: z
    .string()
    .refine(
      (val) =>
        val === "" || /^https?:\/\//i.test(val) || val.startsWith("blob:"),
      "Ảnh SKU không hợp lệ"
    ),
  options: z.array(variantOptionSchema),
})

export const productFormSchema = z
  .object({
    name: z.string().min(3, "Tên SPU phải có ít nhất 3 ký tự"),
    description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
    brand: z.string().min(1, "Vui lòng chọn thương hiệu"),
    imgUrl: z
      .string()
      .min(1, "Vui lòng chọn ảnh đại diện SPU")
      .refine(
        (val) => /^https?:\/\//i.test(val) || val.startsWith("blob:"),
        "Vui lòng chọn ảnh đại diện SPU"
      ),
    isActive: z.boolean(),
    optionAxes: z
      .array(z.string().min(1, "Tên trục Option không được để trống"))
      .min(1, "SPU cần ít nhất một trục Option"),
    variants: z.array(variantSchema).min(1, "Vui lòng thêm ít nhất 1 SKU"),
  })
  .superRefine((data, ctx) => {
    if (new Set(data.optionAxes).size !== data.optionAxes.length) {
      ctx.addIssue({
        code: "custom",
        message: "Không được trùng trục Option trên SPU",
        path: ["optionAxes"],
      })
    }

    const skuCodes = data.variants.map((v) => v.sku.trim())
    const codeCounts = new Map<string, number>()
    for (const code of skuCodes) {
      codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1)
    }
    skuCodes.forEach((code, index) => {
      if (code && (codeCounts.get(code) ?? 0) > 1) {
        ctx.addIssue({
          code: "custom",
          message: `Mã "${code}" bị trùng trong danh sách`,
          path: ["variants", index, "sku"],
        })
      }
    })

    const combos = data.variants.map((variant) =>
      data.optionAxes
        .map((axis) => {
          const match = variant.options.find((o) => o.optionName === axis)
          return `${axis}:${match?.value ?? ""}`
        })
        .join("|")
    )
    if (new Set(combos).size !== combos.length) {
      ctx.addIssue({
        code: "custom",
        message: "Hai SKU không được có cùng tổ hợp thuộc tính",
        path: ["variants"],
      })
    }
  })

export type ProductFormValues = z.infer<typeof productFormSchema>
export type VariantFormValues = z.infer<typeof variantSchema>

export const createDefaultVariant = (
  optionAxes: string[]
): VariantFormValues => ({
  sku: "",
  price: 0,
  stockQuantity: 0,
  imgUrl: "",
  options: optionAxes.map((optionName) => ({ optionName, value: "" })),
})

export const defaultProductFormValues = (): ProductFormValues => {
  const optionAxes = ["Color", "Storage"]
  return {
    name: "",
    description: "",
    categoryId: "",
    brand: "",
    imgUrl: "",
    isActive: true,
    optionAxes,
    variants: [createDefaultVariant(optionAxes)],
  }
}
