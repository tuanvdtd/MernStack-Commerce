import type { ProductFormValues, VariantFormValues } from "~/lib/admin/productFormSchema"

export type ProductOptionDefinition = ProductFormValues["optionDefinitions"][number]

/** Kiểm tra SPU đang ở chế độ sản phẩm đơn giản (không có trục option). */
export const hasVariantOptions = (
  optionDefinitions: ProductOptionDefinition[]
): boolean => optionDefinitions.length > 0

/** Suy ra optionDefinitions từ dữ liệu SPU đã lưu. */
export const deriveOptionDefinitions = (
  optionAxes: string[],
  variants: Array<{ options: { optionName: string; value: string }[] }>
): ProductOptionDefinition[] => {
  if (optionAxes.length === 0) return []

  return optionAxes.map((name) => {
    const values = [
      ...new Set(
        variants
          .map(
            (variant) =>
              variant.options.find((option) => option.optionName === name)?.value ??
              ""
          )
          .filter(Boolean)
      ),
    ]
    return { name, values }
  })
}

/** Tạo key combo duy nhất từ danh sách option của SKU. */
export const buildVariantComboKey = (
  optionAxes: string[],
  options: VariantFormValues["options"]
): string =>
  optionAxes
    .map((axis) => {
      const value =
        options.find((option) => option.optionName === axis)?.value ?? ""
      return `${axis}:${value}`
    })
    .join("|")

/** Sinh cartesian product SKU từ optionDefinitions, giữ price/stock/id nếu combo trùng. */
export const generateVariantsFromOptionDefinitions = (
  optionDefinitions: ProductOptionDefinition[],
  existingVariants: VariantFormValues[],
  fallback: Pick<VariantFormValues, "price" | "stockQuantity"> = {
    price: 0,
    stockQuantity: 0,
  }
): VariantFormValues[] => {
  if (optionDefinitions.length === 0) return []

  const optionAxes = optionDefinitions.map((definition) => definition.name)
  const valueLists = optionDefinitions.map((definition) =>
    definition.values.filter(Boolean)
  )

  if (valueLists.some((values) => values.length === 0)) return []

  const combos: Array<Record<string, string>> = []

  /** Duyệt đệ quy để tạo mọi tổ hợp giá trị option. */
  const walk = (axisIndex: number, current: Record<string, string>) => {
    if (axisIndex >= optionAxes.length) {
      combos.push({ ...current })
      return
    }

    for (const value of valueLists[axisIndex]) {
      current[optionAxes[axisIndex]] = value
      walk(axisIndex + 1, current)
    }
  }

  walk(0, {})

  return combos.map((combo) => {
    const options = optionAxes.map((optionName) => ({
      optionName,
      value: combo[optionName] ?? "",
    }))
    const comboKey = buildVariantComboKey(optionAxes, options)
    const existing = existingVariants.find(
      (variant) => buildVariantComboKey(optionAxes, variant.options) === comboKey
    )

    return {
      id: existing?.id,
      price: existing?.price ?? fallback.price,
      stockQuantity: existing?.stockQuantity ?? fallback.stockQuantity,
      imgUrl: existing?.imgUrl ?? "",
      options,
    }
  })
}

/** Tạo SKU mặc định cho sản phẩm đơn giản. */
export const createSimpleProductVariant = (
  basePrice: number,
  baseStock: number,
  existing?: VariantFormValues
): VariantFormValues => ({
  id: existing?.id,
  price: basePrice,
  stockQuantity: baseStock,
  imgUrl: existing?.imgUrl ?? "",
  options: [],
})
