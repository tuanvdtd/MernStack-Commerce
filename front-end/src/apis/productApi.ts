import type { SPU } from "~/types/admin/index"
import api from "./axiosConfig"

export type CreateProductVariantPayload = {
  sku: string
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
  imgUrl: string
  isActive: boolean
  optionAxes: string[]
  variants: CreateProductVariantPayload[]
}

export type PatchProductSpuPayload = {
  name?: string
  description?: string
  categoryId?: string
  brand?: string
  imgUrl?: string
  isActive?: boolean
  optionAxes?: string[]
}

export type UpdateProductVariantsPayload = {
  optionAxes: string[]
  variants: CreateProductVariantPayload[]
}

export type ProductImageFiles = {
  spuImage?: File
  skuImages?: Record<number, File>
}

function getErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { message?: string } } }
  return err.response?.data?.message || "Unable to process the request"
}

const isRemoteImageUrl = (url: string | undefined) =>
  Boolean(url?.trim() && /^https?:\/\//i.test(url.trim()))

function buildFormData(
  payload: CreateProductPayload | PatchProductSpuPayload | UpdateProductVariantsPayload,
  files?: ProductImageFiles
) {
  const formData = new FormData()
  formData.append("data", JSON.stringify(payload))

  if (files?.spuImage) {
    formData.append("spuImage", files.spuImage)
  }

  for (const [index, file] of Object.entries(files?.skuImages ?? {})) {
    formData.append(`skuImage_${index}`, file)
  }

  return formData
}

function buildCreateFormData(
  payload: CreateProductPayload,
  files?: ProductImageFiles
) {
  const normalizedPayload: CreateProductPayload = {
    ...payload,
    imgUrl: isRemoteImageUrl(payload.imgUrl) ? payload.imgUrl.trim() : "",
    variants: payload.variants.map((variant) => {
      const { imgUrl, ...rest } = variant
      return {
        ...rest,
        ...(imgUrl && isRemoteImageUrl(imgUrl) ? { imgUrl: imgUrl.trim() } : {}),
      }
    }),
  }

  return buildFormData(normalizedPayload, files)
}

function buildVariantsFormData(
  payload: UpdateProductVariantsPayload,
  files?: ProductImageFiles
) {
  const normalizedPayload: UpdateProductVariantsPayload = {
    ...payload,
    variants: payload.variants.map((variant) => {
      const { imgUrl, ...rest } = variant
      return {
        ...rest,
        ...(imgUrl && isRemoteImageUrl(imgUrl) ? { imgUrl: imgUrl.trim() } : {}),
      }
    }),
  }

  return buildFormData(normalizedPayload, files)
}

const multipartConfig = {
  transformRequest: [
    (data: unknown, headers?: Record<string, string>) => {
      if (headers) delete headers["Content-Type"]
      return data
    },
  ],
}

export async function fetchProducts(): Promise<SPU[]> {
  const response = await api.get<SPU[]>("/products")
  return response.data
}

export async function fetchProductById(id: string): Promise<SPU> {
  const response = await api.get<SPU>(`/products/${id}`)
  return response.data
}

export async function createProduct(
  payload: CreateProductPayload,
  files?: ProductImageFiles
): Promise<SPU> {
  const response = await api.post<SPU>(
    "/products",
    buildCreateFormData(payload, files),
    multipartConfig
  )
  return response.data
}

/** Edit step 1: PATCH only changed SPU fields, plus the SPU image if any. */
export async function patchProductSpu(
  id: string,
  payload: PatchProductSpuPayload,
  files?: ProductImageFiles
): Promise<SPU> {
  const response = await api.patch<SPU>(
    `/products/${id}`,
    buildFormData(payload, files),
    multipartConfig
  )
  return response.data
}

/** Edit step 2: PUT the full SKU list, plus indexed SKU images. */
export async function updateProductVariants(
  id: string,
  payload: UpdateProductVariantsPayload,
  files?: ProductImageFiles
): Promise<SPU> {
  const response = await api.put<SPU>(
    `/products/${id}/variants`,
    buildVariantsFormData(payload, files),
    multipartConfig
  )
  return response.data
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`)
}

export { getErrorMessage as getProductApiError }
