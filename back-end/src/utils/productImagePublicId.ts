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

export function buildSkuPublicId(productId: string, sku: string): string {
  return `${productId}/sku-${sanitizeForPublicId(sku)}`
}
