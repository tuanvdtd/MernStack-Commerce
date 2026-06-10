export function generateProductSlug(name: string): string {
  const base = name.trim().toLowerCase().replace(/\s+/g, '-')
  return `${base}-${Date.now()}`
}

export function generateCategorySlug(name: string): string {
  const base = name.trim().toLowerCase().replace(/\s+/g, '-')
  return base || `category-${Date.now()}`
}
