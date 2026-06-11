import { Prisma } from '~/generated/prisma/client'
import { prisma } from '~/lib/prisma'
import type {
  CreateReviewInput,
  PatchReviewInput,
  ReviewListFilters,
} from '~/modules/reviews/review.types'

const reviewInclude = {
  user: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
} as const

export type ReviewWithUser = Awaited<ReturnType<typeof ReviewRepo.findById>>

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

/** Làm tròn rating trung bình 1 chữ số thập phân — giống logic ecommerce phổ biến. */
function roundAverageRating(value: number): number {
  return Math.round(value * 10) / 10
}

/** Tính lại averageRating và reviewCount trên SPU sau khi thay đổi review. */
async function recalcProductRating(tx: Tx, productId: string) {
  const agg = await tx.productReview.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  })

  const average = agg._avg.rating ?? 0

  await tx.product.update({
    where: { id: productId },
    data: {
      averageRating: roundAverageRating(average),
      reviewCount: agg._count.rating,
    },
  })
}

export const ReviewRepo = {
  /** Danh sách review của một SPU, mới nhất trước. */
  async listByProduct(filters: ReviewListFilters) {
    const where = { productId: filters.productId }
    const skip = (filters.page - 1) * filters.limit

    const [items, total] = await Promise.all([
      prisma.productReview.findMany({
        where,
        include: reviewInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: filters.limit,
      }),
      prisma.productReview.count({ where }),
    ])

    return { items, total }
  },

  /** Lấy một review kèm thông tin user. */
  async findById(id: string) {
    return prisma.productReview.findUnique({
      where: { id },
      include: reviewInclude,
    })
  },

  /** Tạo review mới và cập nhật rating tổng hợp trên Product. */
  async create(userId: number, productId: string, input: CreateReviewInput) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.productReview.create({
        data: {
          userId,
          productId,
          rating: input.rating,
          comment: input.comment ?? null,
        },
        include: reviewInclude,
      })

      await recalcProductRating(tx, productId)
      return review
    })
  },

  /** Cập nhật review và đồng bộ lại rating tổng hợp. */
  async update(id: string, input: PatchReviewInput) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.productReview.update({
        where: { id },
        data: {
          ...(input.rating != null ? { rating: input.rating } : {}),
          ...(input.comment !== undefined ? { comment: input.comment } : {}),
        },
        include: reviewInclude,
      })

      await recalcProductRating(tx, review.productId)
      return review
    })
  },

  /** Xóa review và đồng bộ lại rating tổng hợp. */
  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.productReview.delete({
        where: { id },
        include: reviewInclude,
      })

      await recalcProductRating(tx, review.productId)
      return review
    })
  },

  /** Kiểm tra lỗi unique userId + productId khi tạo trùng. */
  isUniqueViolation(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
  },
}
