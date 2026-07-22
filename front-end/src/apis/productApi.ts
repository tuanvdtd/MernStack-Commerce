import type { SPU } from "~/types/admin/index"
import api from "./axiosConfig"

export type ProductImagePayload = {
  url: string
  publicId: string
  sortOrder: number
  alt?: string
}

export type CreateProductVariantPayload = {
  id?: string
  price: number
  stockQuantity: number
  imgUrl?: string
  options: Array<{ optionName: string; value: string }>
}

export type CreateProductPayload = {
  name: string
  description: string
  categoryId: string
  brand: string
  images: ProductImagePayload[]
  isActive: boolean
  optionAxes: string[]
  variants: CreateProductVariantPayload[]
}

export type PatchProductSpuPayload = {
  name?: string
  description?: string
  categoryId?: string
  brand?: string
  images?: ProductImagePayload[]
  isActive?: boolean
  optionAxes?: string[]
}

export type UpdateProductVariantsPayload = {
  optionAxes: string[]
  variants: CreateProductVariantPayload[]
}

function getErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { message?: string } } }
  return err.response?.data?.message || "Unable to process the request"
}

const isRemoteImageUrl = (url: string | undefined) =>
  Boolean(url?.trim() && /^https?:\/\//i.test(url.trim()))

const mapImagesPayload = (
  images: ProductImagePayload[]
): ProductImagePayload[] =>
  [...images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image, index) => ({
      url: image.url.trim(),
      publicId: image.publicId.trim(),
      sortOrder: index,
      ...(image.alt?.trim() ? { alt: image.alt.trim() } : {}),
    }))

const mapVariantPayload = (variant: CreateProductVariantPayload) => ({
  ...(variant.id ? { id: variant.id } : {}),
  price: variant.price,
  stockQuantity: variant.stockQuantity,
  ...(isRemoteImageUrl(variant.imgUrl)
    ? { imgUrl: variant.imgUrl!.trim() }
    : {}),
  options: variant.options.map((option) => ({
    optionName: option.optionName,
    value: option.value.trim(),
  })),
})

export async function fetchProducts(): Promise<SPU[]> {
  const response = await api.get<SPU[]>("/products")
  return response.data
}

export async function fetchProductById(id: string): Promise<SPU> {
  const response = await api.get<SPU>(`/products/${id}`)
  return response.data
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<SPU> {
  const response = await api.post<SPU>("/products", {
    ...payload,
    images: mapImagesPayload(payload.images),
    variants: payload.variants.map(mapVariantPayload),
  })
  return response.data
}

/** Edit step 1: PATCH only changed SPU fields, including gallery JSON. */
export async function patchProductSpu(
  id: string,
  payload: PatchProductSpuPayload
): Promise<SPU> {
  const body: PatchProductSpuPayload = { ...payload }
  if (payload.images) {
    body.images = mapImagesPayload(payload.images)
  }

  const response = await api.patch<SPU>(`/products/${id}`, body)
  return response.data
}

/** Edit step 2: PUT the full SKU list. */
export async function updateProductVariants(
  id: string,
  payload: UpdateProductVariantsPayload
): Promise<SPU> {
  const response = await api.put<SPU>(`/products/${id}/variants`, {
    ...payload,
    variants: payload.variants.map(mapVariantPayload),
  })
  return response.data
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`)
}

export { getErrorMessage as getProductApiError }
