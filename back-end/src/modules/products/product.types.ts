export type VariantOptionInput = {
  optionName: string
  value: string
}

export type ProductImageInput = {
  url: string
  publicId: string
  sortOrder: number
  alt?: string
}

export type CreateVariantInput = {
  /** Có khi cập nhật variant đã tồn tại; bỏ trống khi tạo variant mới. */
  id?: string
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
  images: ProductImageInput[]
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
  images?: ProductImageInput[]
  isActive?: boolean
  optionAxes?: string[]
}

/** Body PUT /products/:id/variants — đồng bộ full danh sách variant theo id. */
export type UpdateProductVariantsInput = {
  optionAxes: string[]
  variants: CreateVariantInput[]
}
