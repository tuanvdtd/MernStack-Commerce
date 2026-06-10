export type VariantOptionInput = {
  optionName: string
  value: string
}

export type CreateVariantInput = {
  sku: string
  price: number
  stockQuantity: number
  imgUrl?: string
  options: VariantOptionInput[]
}

export type CreateProductInput = {
  name: string
  description: string
  categoryId: string
  brand: string
  imgUrl: string
  isActive: boolean
  optionAxes: string[]
  variants: CreateVariantInput[]
}

export type UpdateProductInput = CreateProductInput
