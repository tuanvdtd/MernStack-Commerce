/** Một document trên index `products_v2` = 1 SKU (ProductVariant). */
export type SkuEsDocument = {
  skuId: string
  spuId: string
  skuTitle: string
  skuPrice: number
  skuImg: string
  hasStock: boolean
  hotScore: number
  saleCount: number
  brandId: string
  brandName: string
  catalogId: string
  catalogName: string
  attrs: SkuAttr[]
}

export type SkuAttr = {
  attrId: string
  attrName: string
  attrValue: string
}

/** Một filter option đã parse từ query, ví dụ { name: 'Color', value: 'Blue' }. */
export type ParsedOption = {
  name: string
  value: string
}

/** Kết quả parse query thô: phần text còn lại + các option đã nhận diện. */
export type ParsedQuery = {
  q: string
  options: ParsedOption[]
}

export type AttributeDictionaryEntry = {
  normalizedValue: string
  synonyms: string[]
}

/** Map<optionName, entries[]> — nguồn dữ liệu cho query parser. */
export type AttributeDictionary = Map<string, AttributeDictionaryEntry[]>
