import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { adminBrandButtonClass, adminGhostButtonClass } from "~/lib/admin/ui"

type AdminPaginationProps = {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  itemLabel?: string
}

const getPageNumbers = (currentPage: number, totalPages: number) => {
  const maxVisible = 5
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5]
  }
  if (currentPage >= totalPages - 2) {
    return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)
  }
  return Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
}

export const AdminPagination = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemLabel = "mục",
}: AdminPaginationProps) => {
  const safeTotalPages = Math.max(1, totalPages)
  const showPageButtons = safeTotalPages > 1

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-muted-foreground">
        {totalItems === 0 ? (
          <>0 {itemLabel}</>
        ) : (
          <>
            Trang {currentPage}/{safeTotalPages}
          </>
        )}
      </p>
      {showPageButtons && (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("h-8 bg-background text-[13px]", adminGhostButtonClass)}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Trước
          </Button>
          {getPageNumbers(currentPage, safeTotalPages).map((pageNum) => (
            <Button
              key={pageNum}
              type="button"
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 min-w-8 bg-background font-mono text-[13px] tabular-nums",
                adminGhostButtonClass,
                currentPage === pageNum && adminBrandButtonClass
              )}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("h-8 bg-background text-[13px]", adminGhostButtonClass)}
            onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
            disabled={currentPage === safeTotalPages}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  )
}
