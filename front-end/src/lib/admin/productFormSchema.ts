import * as z from "zod"

/** Strip HTML tags and collapse whitespace for plain-text length checks. */
const getPlainTextFromHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()

export const variantOptionSchema = z.object({
  optionName: z.string(),
  value: z.string().min(1, "Choose a value for this attribute"),
})

export const variantSchema = z.object({
  /** Có khi variant đã lưu; variant mới không gửi id — BE sinh UUID v7. */
  id: z.string().optional(),
  price: z.number().min(1000, "Sale price must be at least 1,000 VND"),
  stockQuantity: z.number().min(0, "Stock cannot be negative"),
  imgUrl: z
    .string()
    .refine(
      (val) =>
        val === "" || /^https?:\/\//i.test(val) || val.startsWith("blob:"),
      "SKU image is invalid"
    ),
  options: z.array(variantOptionSchema),
})

export const productFormSchema = z
  .object({
    name: z.string().min(3, "SPU name must be at least 3 characters"),
    description: z
      .string()
      .refine(
        (value) => getPlainTextFromHtml(value).length >= 10,
        "Description must be at least 10 characters"
      ),
    categoryId: z.string().min(1, "Please choose a category"),
    brand: z.string().min(1, "Please choose a brand"),
    imgUrl: z
      .string()
      .min(1, "Please choose an SPU cover image")
      .refine(
        (val) => /^https?:\/\//i.test(val) || val.startsWith("blob:"),
        "Please choose an SPU cover image"
      ),
    isActive: z.boolean(),
    optionAxes: z
      .array(z.string().min(1, "Option axis name is required"))
      .min(1, "SPU needs at least one option axis"),
    variants: z.array(variantSchema).min(1, "Please add at least 1 SKU"),
  })
  .superRefine((data, ctx) => {
    if (new Set(data.optionAxes).size !== data.optionAxes.length) {
      ctx.addIssue({
        code: "custom",
        message: "Option axes cannot be duplicated on the SPU",
        path: ["optionAxes"],
      })
    }

    const variantIds = data.variants
      .map((v) => v.id?.trim())
      .filter(Boolean) as string[]
    if (new Set(variantIds).size !== variantIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "Duplicate variant ids in the list",
        path: ["variants"],
      })
    }

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
        message: "Two SKUs cannot share the same attribute combination",
        path: ["variants"],
      })
    }
  })

export type ProductFormValues = z.infer<typeof productFormSchema>
export type VariantFormValues = z.infer<typeof variantSchema>

export const createDefaultVariant = (
  optionAxes: string[]
): VariantFormValues => ({
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
