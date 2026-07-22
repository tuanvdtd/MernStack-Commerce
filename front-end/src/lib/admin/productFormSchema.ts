import * as z from "zod"
import {
  generateVariantsFromOptionDefinitions,
  hasVariantOptions,
} from "~/lib/admin/variantGeneration"

/** Strip HTML tags and collapse whitespace for plain-text length checks. */
const getPlainTextFromHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()

export const productImageSchema = z.object({
  url: z
    .string()
    .min(1)
    .refine((val) => /^https?:\/\//i.test(val), "Invalid image URL"),
  publicId: z.string().min(1, "Missing image reference"),
  sortOrder: z.number().int().min(0),
  alt: z.string().optional(),
})

export const productOptionDefinitionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  values: z.array(z.string().min(1)).min(1, "Add at least one option value"),
})

export const variantOptionSchema = z.object({
  optionName: z.string(),
  value: z.string(),
})

export const variantSchema = z.object({
  /** Có khi variant đã lưu; variant mới không gửi id — BE sinh UUID v7. */
  id: z.string().optional(),
  price: z.number().min(1000, "Sale price must be at least 1,000 VND"),
  stockQuantity: z.number().min(0, "Stock cannot be negative"),
  imgUrl: z
    .string()
    .refine(
      (val) => val === "" || /^https?:\/\//i.test(val),
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
    images: z
      .array(productImageSchema)
      .min(1, "Please add at least one product image")
      .max(9, "Product gallery supports up to 9 images"),
    isActive: z.boolean(),
    basePrice: z.number().min(0),
    baseStock: z.number().min(0),
    optionDefinitions: z.array(productOptionDefinitionSchema),
    variants: z.array(variantSchema),
  })
  .superRefine((data, ctx) => {
    const sortOrders = data.images.map((image) => image.sortOrder)
    if (new Set(sortOrders).size !== sortOrders.length) {
      ctx.addIssue({
        code: "custom",
        message: "Duplicate image order in gallery",
        path: ["images"],
      })
    }

    const optionNames = data.optionDefinitions.map((definition) => definition.name)
    if (new Set(optionNames).size !== optionNames.length) {
      ctx.addIssue({
        code: "custom",
        message: "Option names cannot be duplicated",
        path: ["optionDefinitions"],
      })
    }

    if (!hasVariantOptions(data.optionDefinitions)) {
      if (data.basePrice < 1000) {
        ctx.addIssue({
          code: "custom",
          message: "Sale price must be at least 1,000 VND",
          path: ["basePrice"],
        })
      }

      if (data.variants.length !== 1) {
        ctx.addIssue({
          code: "custom",
          message: "Simple product must have exactly one SKU",
          path: ["variants"],
        })
      }

      if (data.variants[0]?.price !== data.basePrice) {
        ctx.addIssue({
          code: "custom",
          message: "Price must match the value in the Price section",
          path: ["basePrice"],
        })
      }

      if (data.variants[0]?.stockQuantity !== data.baseStock) {
        ctx.addIssue({
          code: "custom",
          message: "Inventory must match the value in the Price section",
          path: ["baseStock"],
        })
      }

      return
    }

    const optionAxes = data.optionDefinitions.map((definition) => definition.name)
    const expectedVariants = generateVariantsFromOptionDefinitions(
      data.optionDefinitions,
      data.variants
    )

    if (expectedVariants.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Add values for each option before saving",
        path: ["optionDefinitions"],
      })
      return
    }

    if (data.variants.length !== expectedVariants.length) {
      ctx.addIssue({
        code: "custom",
        message: "Variant list is out of sync with option values",
        path: ["variants"],
      })
    }

    const variantIds = data.variants
      .map((variant) => variant.id?.trim())
      .filter(Boolean) as string[]
    if (new Set(variantIds).size !== variantIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "Duplicate variant ids in the list",
        path: ["variants"],
      })
    }

    const combos = data.variants.map((variant) =>
      buildVariantComboKey(optionAxes, variant.options)
    )
    if (new Set(combos).size !== combos.length) {
      ctx.addIssue({
        code: "custom",
        message: "Two SKUs cannot share the same attribute combination",
        path: ["variants"],
      })
    }

    for (let index = 0; index < data.variants.length; index++) {
      const variant = data.variants[index]
      for (const axis of optionAxes) {
        const match = variant.options.find((option) => option.optionName === axis)
        if (!match?.value.trim()) {
          ctx.addIssue({
            code: "custom",
            message: `Missing value for option "${axis}"`,
            path: ["variants", index, "options"],
          })
        }
      }
    }
  })

/** Tạo key combo duy nhất từ danh sách option của SKU. */
const buildVariantComboKey = (
  optionAxes: string[],
  options: z.infer<typeof variantOptionSchema>[]
): string =>
  optionAxes
    .map((axis) => {
      const value =
        options.find((option) => option.optionName === axis)?.value ?? ""
      return `${axis}:${value}`
    })
    .join("|")

export type ProductFormValues = z.infer<typeof productFormSchema>
export type ProductImageFormValues = z.infer<typeof productImageSchema>
export type ProductOptionDefinitionFormValues = z.infer<
  typeof productOptionDefinitionSchema
>
export type VariantFormValues = z.infer<typeof variantSchema>

export const defaultProductFormValues = (): ProductFormValues => ({
  name: "",
  description: "",
  categoryId: "",
  brand: "",
  images: [],
  isActive: true,
  basePrice: 0,
  baseStock: 0,
  optionDefinitions: [],
  variants: [
    {
      price: 0,
      stockQuantity: 0,
      imgUrl: "",
      options: [],
    },
  ],
})
