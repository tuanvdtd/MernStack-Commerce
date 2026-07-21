import type { ProductReview } from '~/generated/prisma/client'

import type { ReviewItem } from '~/modules/reviews/review.types'

type ReviewWithUser = ProductReview & {
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

/** Map entity Prisma sang DTO review cho storefront. */
export function toReviewItem(review: ReviewWithUser): ReviewItem {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    user: {
      id: review.user.id,
      name: review.user.name,
      avatarUrl: review.user.avatarUrl,
    },
  }
}
