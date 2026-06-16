import * as z from "zod"

export const variantOptionSchema = z.object({
  optionName: z.string(),
  value: z.string().min(1, "Choose a value for this attribute"),
})

export const variantSchema = z.object({
  id: z.string().optional(),
  sku: z
    .string()
    .min(1, "SKU code is required")
    .min(3, "SKU code must be at least 3 characters"),
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
    description: z.string().min(10, "Description must be at least 10 characters"),
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

    const skuCodes = data.variants.map((v) => v.sku.trim())
    const codeCounts = new Map<string, number>()
    for (const code of skuCodes) {
      codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1)
    }
    skuCodes.forEach((code, index) => {
      if (code && (codeCounts.get(code) ?? 0) > 1) {
        ctx.addIssue({
          code: "custom",
          message: `Code "${code}" is duplicated in the list`,
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
