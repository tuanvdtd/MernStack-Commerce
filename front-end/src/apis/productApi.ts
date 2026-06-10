import type { SPU } from "~/types/admin/index"
import api from "./axiosConfig"

export type CreateProductPayload = {
  name: string
  description: string
  categoryId: string
  brand: string
  imgUrl: string
  isActive: boolean
  optionAxes: string[]
  variants: Array<{
    sku: string
    price: number
    stockQuantity: number
    imgUrl?: string
    options: Array<{ optionName: string; value: string }>
  }>
}

export type ProductImageFiles = {
  spuImage?: File
  skuImages?: Record<number, File>
}

function getErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { message?: string } } }
  return err.response?.data?.message || "Không thể xử lý yêu cầu"
}

const isRemoteImageUrl = (url: string | undefined) =>
  Boolean(url?.trim() && /^https?:\/\//i.test(url.trim()))

function buildProductFormData(
  payload: CreateProductPayload,
  files?: ProductImageFiles
) {
  const formData = new FormData()
  const normalizedPayload: CreateProductPayload = {
    ...payload,
    imgUrl: isRemoteImageUrl(payload.imgUrl) ? payload.imgUrl.trim() : "",
    variants: payload.variants.map((variant) => {
      const { imgUrl, ...rest } = variant
      return {
        ...rest,
        ...(isRemoteImageUrl(imgUrl) ? { imgUrl: imgUrl.trim() } : {}),
      }
    }),
  }

  formData.append("data", JSON.stringify(normalizedPayload))

  if (files?.spuImage) {
    formData.append("spuImage", files.spuImage)
  }

  for (const [index, file] of Object.entries(files?.skuImages ?? {})) {
    formData.append(`skuImage_${index}`, file)
  }

  return formData
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
    buildProductFormData(payload, files),
    multipartConfig
  )
  return response.data
}

export async function updateProduct(
  id: string,
  payload: CreateProductPayload,
  files?: ProductImageFiles
): Promise<SPU> {
  const response = await api.put<SPU>(
    `/products/${id}`,
    buildProductFormData(payload, files),
    multipartConfig
  )
  return response.data
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`)
}

export { getErrorMessage as getProductApiError }
