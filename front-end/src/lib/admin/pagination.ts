export const ADMIN_PAGE_SIZE = 10

export const paginate = <T>(items: T[], page: number, pageSize = ADMIN_PAGE_SIZE) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (safePage - 1) * pageSize
  return {
    items: items.slice(startIndex, startIndex + pageSize),
    totalPages,
    startIndex,
    currentPage: safePage,
  }
}
