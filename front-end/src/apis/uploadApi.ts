import api from './axiosConfig'

export type UploadProductImageResponse = {
  secureUrl: string
  publicId: string
}

function getErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { message?: string } } }
  return err.response?.data?.message || 'Không thể tải ảnh lên'
}

export async function deleteProductImage(publicId: string): Promise<void> {
  await api.delete('/upload/product-image', { data: { publicId } })
}

export async function uploadProductImage(file: File): Promise<UploadProductImageResponse> {
  const formData = new FormData()
  formData.append('productImage', file)

  const response = await api.post<UploadProductImageResponse>(
    '/upload/product-image',
    formData,
    {
      transformRequest: [
        (data, headers) => {
          if (headers) delete headers['Content-Type']
          return data
        },
      ],
    },
  )

  return response.data
}

export { getErrorMessage as getUploadApiError }
