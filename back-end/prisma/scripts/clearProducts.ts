import { prisma } from '~/lib/prisma'

/**
 * Xóa toàn bộ SPU/SKU và dữ liệu phụ thuộc (gallery, review, giỏ hàng liên quan…).
 * Giữ lại user, role, category, option, discount (header).
 */
async function clearProducts() {
  await prisma.$transaction(async (tx) => {
    const deletedCartItems = await tx.cartItem.deleteMany()
    await tx.cart.updateMany({ data: { countProduct: 0 } })
    const deletedReviews = await tx.productReview.deleteMany()
    const deletedDiscountLinks = await tx.discountProduct.deleteMany()
    const deletedVariantOptions = await tx.productVariantOptionValue.deleteMany()
    const deletedVariants = await tx.productVariant.deleteMany()
    const deletedImages = await tx.productImage.deleteMany()
    const deletedProducts = await tx.product.deleteMany()

    console.log('Đã xóa:')
    console.log(`  - CartItem: ${deletedCartItems.count}`)
    console.log(`  - ProductReview: ${deletedReviews.count}`)
    console.log(`  - DiscountProduct: ${deletedDiscountLinks.count}`)
    console.log(`  - ProductVariantOptionValue: ${deletedVariantOptions.count}`)
    console.log(`  - ProductVariant: ${deletedVariants.count}`)
    console.log(`  - ProductImage: ${deletedImages.count}`)
    console.log(`  - Product: ${deletedProducts.count}`)
  })
}

clearProducts()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
