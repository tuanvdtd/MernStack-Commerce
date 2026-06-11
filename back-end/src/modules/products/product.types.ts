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

/** Body PATCH /products/:id — chỉ field SPU gửi lên, tất cả optional. */
export type PatchProductSpuInput = {
  name?: string
  description?: string
  categoryId?: string
  brand?: string
  imgUrl?: string
  isActive?: boolean
  optionAxes?: string[]
}

/** Body PUT /products/:id/variants — đồng bộ full danh sách SKU. */
export type UpdateProductVariantsInput = {
  optionAxes: string[]
  variants: CreateVariantInput[]
}
