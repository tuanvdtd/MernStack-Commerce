import { logger } from '~/config/logger'
import type { Prisma } from '~/generated/prisma/client'
import { prisma } from '~/lib/prisma'
import {
  bulkIndexSkus,
  deleteSkusBySpu,
} from '~/modules/search/search.es'
import type { SkuEsDocument } from '~/modules/search/search.types'

const productInclude = {
  category: true,
  variants: {
    include: {
      options: {
        include: {
          optionValue: { include: { option: true } },
        },
      },
    },
  },
} satisfies Prisma.ProductInclude

type ProductForSync = Prisma.ProductGetPayload<{ include: typeof productInclude }>

/** Map 1 Product (SPU) + variants thành nhiều SkuEsDocument (mỗi SKU 1 doc). */
function toSkuDocuments(product: ProductForSync): SkuEsDocument[] {
  return product.variants.map((variant) => ({
    skuId: variant.id,
    spuId: product.id,
    skuTitle: product.name,
    skuPrice: Number(variant.price),
    skuImg: variant.imgUrl ?? product.thumbnail ?? '',
    hasStock: variant.stockQuantity > 0,
    hotScore: Number(product.averageRating),
    saleCount: product.reviewCount,
    brandId: product.brand,
    brandName: product.brand,
    catalogId: product.categoryId,
    catalogName: product.category.name,
    attrs: variant.options.map((link) => ({
      attrId: link.optionValue.option.id,
      attrName: link.optionValue.option.name,
      attrValue: link.optionValue.value,
    })),
  }))
}

export const SyncService = {
  /**
   * Đồng bộ 1 SPU sang ES: dọn SKU cũ rồi index lại.
   * Chỉ index product đang active; product inactive/không tồn tại → chỉ xóa.
   */
  async syncSpu(spuId: string): Promise<void> {
    await deleteSkusBySpu(spuId)

    const product = await prisma.product.findUnique({
      where: { id: spuId },
      include: productInclude,
    })

    if (!product || !product.isActive) {
      logger.info({ spuId }, 'Skip indexing (product missing or inactive)')
      return
    }

    const documents = toSkuDocuments(product)
    await bulkIndexSkus(documents)
    logger.info({ spuId, skuCount: documents.length }, 'Synced SPU to Elasticsearch')
  },

  /** Xóa toàn bộ SKU của SPU khỏi ES (dùng khi delete product). */
  async deleteSpu(spuId: string): Promise<void> {
    await deleteSkusBySpu(spuId)
    logger.info({ spuId }, 'Deleted SPU from Elasticsearch')
  },

  /** Reindex toàn bộ product active — dùng cho script khởi tạo dữ liệu. */
  async reindexAll(): Promise<number> {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: productInclude,
    })

    const documents = products.flatMap(toSkuDocuments)
    await bulkIndexSkus(documents)
    logger.info(
      { productCount: products.length, skuCount: documents.length },
      'Reindexed all active products',
    )
    return documents.length
  },
}
