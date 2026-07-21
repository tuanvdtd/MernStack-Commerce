export function sanitizeForPublicId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildSpuPublicId(productId: string): string {
  return `${productId}/spu`
}

/** Public id Cloudinary cho ảnh variant — dùng variant id thay cho mã SKU. */
export function buildVariantPublicId(productId: string, variantId: string): string {
  return `${productId}/variant-${sanitizeForPublicId(variantId)}`
}
