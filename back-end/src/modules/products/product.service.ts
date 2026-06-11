import { ApiError } from '~/core/http/ApiError'
import { toAdminProduct } from '~/modules/products/product.mapper'
import {
  cleanupRemovedVariantImages,
  resolveProductImageUrls,
  resolveSpuImageForPatch,
  resolveVariantsImageUrls,
} from '~/modules/products/product.image'
import type { ProductImageUploads } from '~/modules/products/product.middleware'
import { ProductRepo } from '~/modules/products/product.repo'
import type {
  CreateProductInput,
  PatchProductSpuInput,
  UpdateProductVariantsInput,
} from '~/modules/products/product.types'
import { CategoryRepo } from '~/modules/categories/category.repo'
import { generateProductSlug } from '~/utils/productSlug'

const emptyUploads = (): ProductImageUploads => ({ skus: new Map() })

async function assertSkusUnique(
  variants: CreateProductInput['variants'],
  excludeProductId?: string,
) {
  for (const variant of variants) {
    const existing = await ProductRepo.findBySku(variant.sku, excludeProductId)
    if (existing) {
      throw ApiError.Conflict(`SKU code "${variant.sku}" already exists`)
    }
  }
}

export const ProductService = {
  async list() {
    const products = await ProductRepo.list()
    return products.map(toAdminProduct)
  },

  async getById(id: string) {
    const product = await ProductRepo.findById(id)
    if (!product) throw ApiError.NotFound('Product not found')
    return toAdminProduct(product)
  },

  async create(input: CreateProductInput, files: ProductImageUploads = emptyUploads()) {
    const category = await CategoryRepo.findById(input.categoryId)
    if (!category) throw ApiError.NotFound('Category not found')

    await assertSkusUnique(input.variants)

    const slug = generateProductSlug(input.name)
    const draftInput: CreateProductInput = {
      ...input,
      imgUrl: '',
      variants: input.variants.map((variant) => ({
        ...variant,
        imgUrl: undefined,
      })),
    }

    const created = await ProductRepo.create(draftInput, slug)
    if (!created) throw ApiError.Internal('Failed to create product')

    const resolved = await resolveProductImageUrls(created.id, input, files)

    // Tạo mới: lưu ảnh SPU rồi ghi đè variants kèm ảnh SKU (2 phase sau create draft)
    await ProductRepo.patchSpu(created.id, { imgUrl: resolved.imgUrl })

    const product = await ProductRepo.replaceVariants(created.id, {
      optionAxes: resolved.optionAxes,
      variants: resolved.variants,
    })
    if (!product) throw ApiError.Internal('Failed to save product')

    return toAdminProduct(product)
  },

  /** Bước 1 edit — partial SPU, upload ảnh nếu có file multipart. */
  async patchSpu(
    id: string,
    input: PatchProductSpuInput,
    files: ProductImageUploads = emptyUploads(),
  ) {
    const existing = await ProductRepo.findById(id)
    if (!existing) throw ApiError.NotFound('Product not found')

    if (input.categoryId) {
      const category = await CategoryRepo.findById(input.categoryId)
      if (!category) throw ApiError.NotFound('Category not found')
    }

    const resolved = await resolveSpuImageForPatch(
      id,
      existing.imgUrl,
      input,
      files,
    )

    const product = await ProductRepo.patchSpu(id, resolved)
    if (!product) throw ApiError.Internal('Failed to update product')

    return toAdminProduct(product)
  },

  /** Bước 2 edit — replace toàn bộ SKU, dọn ảnh Cloudinary của SKU bị xóa/đổi. */
  async updateVariants(
    id: string,
    input: UpdateProductVariantsInput,
    files: ProductImageUploads = emptyUploads(),
  ) {
    const existing = await ProductRepo.findById(id)
    if (!existing) throw ApiError.NotFound('Product not found')

    const existingSkus = new Set(existing.variants.map((v) => v.sku))
    const newVariants = input.variants.filter((v) => !existingSkus.has(v.sku))
    await assertSkusUnique(newVariants, id)

    await cleanupRemovedVariantImages(id, existing, input, files)

    const resolved = await resolveVariantsImageUrls(id, input, files)

    try {
      const product = await ProductRepo.replaceVariants(id, resolved)
      if (!product) throw ApiError.Internal('Failed to update variants')
      return toAdminProduct(product)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message.includes('Foreign key constraint')) {
        throw ApiError.Conflict(
          'Cannot remove SKU that is referenced by cart or orders',
        )
      }
      throw error
    }
  },

  async remove(id: string) {
    const existing = await ProductRepo.findById(id)
    if (!existing) throw ApiError.NotFound('Product not found')

    try {
      await ProductRepo.delete(id)
      return { id }
    } catch {
      throw ApiError.Conflict('Cannot delete product with active references')
    }
  },
}
