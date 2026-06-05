import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { useAdminStore } from "~/stores/adminStore"
import { mockProducts } from "~/mock/adminData"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react"
import { toast } from "sonner"
import {
  AdminWorkspace,
  AdminWorkspaceHeader,
  AdminMetricStrip,
  AdminFilterRow,
  AdminFilterSearch,
  AdminFilterField,
  AdminWorkspaceBody,
  AdminWorkspaceFooter,
} from "~/components/admin/AdminWorkspace"
import { AdminTableSkeleton } from "~/components/admin/AdminTableSkeleton"
import { AdminPagination } from "~/components/admin/AdminPagination"
import { AdminEmptyState } from "~/components/admin/AdminEmptyState"
import {
  adminBrandButtonClass,
  adminBrandTextClass,
  adminGhostButtonClass,
  adminMonoClass,
  adminThClass,
  adminTdClass,
  adminDividerClass,
  adminFilterInputClass,
  adminRowActionClass,
  formatVnd,
} from "~/lib/admin/ui"
import { ADMIN_PAGE_SIZE, paginate } from "~/lib/admin/pagination"
import { cn } from "~/lib/utils"

export function ProductsList() {
  const { products, setProducts, deleteProduct } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (products.length === 0) setProducts(mockProducts)
    const timer = window.setTimeout(() => setIsLoading(false), 280)
    return () => window.clearTimeout(timer)
  }, [products, setProducts])

  const categories = Array.from(new Set(products.map((p) => p.categoryName)))

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      product.name.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q) ||
      product.slug.toLowerCase().includes(q)
    const matchesCategory =
      categoryFilter === "all" || product.categoryName === categoryFilter
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" && product.isActive) ||
      (activeFilter === "inactive" && !product.isActive)
    return matchesSearch && matchesCategory && matchesActive
  })

  const { items: paginatedProducts, totalPages } = useMemo(
    () => paginate(filteredProducts, currentPage, ADMIN_PAGE_SIZE),
    [filteredProducts, currentPage]
  )

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const hasActiveFilters =
    searchQuery !== "" || categoryFilter !== "all" || activeFilter !== "all"

  const handleDeleteConfirm = () => {
    if (!selectedProductId) return
    deleteProduct(selectedProductId)
    toast.success("Đã xóa sản phẩm")
    setDeleteDialogOpen(false)
    setSelectedProductId(null)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setActiveFilter("all")
    setCurrentPage(1)
  }

  if (isLoading) return <AdminTableSkeleton />

  return (
    <>
      <AdminWorkspace>
        <AdminWorkspaceHeader
          title="Sản phẩm"
          description="Danh sách SPU trong catalog cửa hàng."
          actions={
            <Link to="/admin/products/create">
              <Button size="sm" className={cn("gap-1.5", adminBrandButtonClass)}>
                <Plus className="size-3.5" strokeWidth={2} />
                Thêm SPU
              </Button>
            </Link>
          }
        />

        <AdminMetricStrip
          metrics={[
            { label: "Tổng SPU", value: products.length },
            {
              label: "Đang bán",
              value: products.filter((p) => p.isActive).length,
              tone: "success",
            },
            {
              label: "Đã ẩn",
              value: products.filter((p) => !p.isActive).length,
            },
            {
              label: "Sắp hết hàng",
              value: products.filter((p) => p.totalStock < 10).length,
              tone: "warning",
            },
          ]}
        />

        <AdminFilterRow>
          <AdminFilterSearch label="Từ khóa">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-brand)]"
                strokeWidth={2}
              />
              <Input
                placeholder="Tên, slug, thương hiệu..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className={cn("pl-9", adminFilterInputClass)}
              />
            </div>
          </AdminFilterSearch>
          <AdminFilterField label="Danh mục">
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className={cn("w-full", adminFilterInputClass)}>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminFilterField>
          <AdminFilterField label="Trạng thái">
            <Select
              value={activeFilter}
              onValueChange={(v) => {
                setActiveFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className={cn("w-full", adminFilterInputClass)}>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang bán</SelectItem>
                <SelectItem value="inactive">Đã ẩn</SelectItem>
              </SelectContent>
            </Select>
          </AdminFilterField>
        </AdminFilterRow>

        <AdminWorkspaceBody>
          <Table>
            <TableHeader>
              <TableRow className={cn("hover:bg-transparent", adminDividerClass)}>
                <TableHead className={adminThClass}>Sản phẩm</TableHead>
                <TableHead className={adminThClass}>Slug</TableHead>
                <TableHead className={adminThClass}>Danh mục</TableHead>
                <TableHead className={adminThClass}>SKU</TableHead>
                <TableHead className={adminThClass}>Giá</TableHead>
                <TableHead className={adminThClass}>Tồn</TableHead>
                <TableHead className={adminThClass}>Trạng thái</TableHead>
                <TableHead className={cn(adminThClass, "text-right")}>
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="p-0">
                    <AdminEmptyState
                      icon={Package}
                      title="Không tìm thấy sản phẩm"
                      description={
                        hasActiveFilters
                          ? "Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
                          : "Catalog đang trống."
                      }
                      action={
                        hasActiveFilters ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[13px]"
                            onClick={handleClearFilters}
                          >
                            Xóa bộ lọc
                          </Button>
                        ) : (
                          <Link to="/admin/products/create">
                            <Button size="sm" className={adminBrandButtonClass}>
                              Thêm SPU
                            </Button>
                          </Link>
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className={cn("group", adminDividerClass)}
                  >
                    <TableCell className={adminTdClass}>
                      <div className="flex items-center gap-3">
                        {product.imgUrl ? (
                          <img
                            src={product.imgUrl}
                            alt=""
                            className="size-9 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                            <Package className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                          </div>
                        )}
                        <div className="min-w-0 max-w-[220px]">
                          <p className="truncate font-medium">{product.name}</p>
                          <p className="truncate text-[12px] text-muted-foreground">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={cn(adminTdClass, adminMonoClass)}>
                      {product.slug}
                    </TableCell>
                    <TableCell className={adminTdClass}>
                      {product.categoryName}
                    </TableCell>
                    <TableCell className={cn(adminTdClass, adminMonoClass)}>
                      {product.skus.length}
                    </TableCell>
                    <TableCell className={adminTdClass}>
                      <span className={cn("font-mono font-medium", adminBrandTextClass)}>
                        {formatVnd(product.minPrice)}
                      </span>
                      {product.minPrice !== product.maxPrice && (
                        <p className="text-[12px] text-muted-foreground">
                          đến {formatVnd(product.maxPrice)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className={adminTdClass}>
                      <span
                        className={cn(
                          "font-mono font-medium",
                          product.totalStock < 10
                            ? "text-red-600 dark:text-red-400"
                            : "text-foreground"
                        )}
                      >
                        {product.totalStock}
                      </span>
                    </TableCell>
                    <TableCell className={adminTdClass}>
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium",
                          product.isActive
                            ? "bg-[var(--admin-brand)]/10 text-[var(--admin-brand)]"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {product.isActive ? "Đang bán" : "Ẩn"}
                      </span>
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "text-right")}>
                      <div className={adminRowActionClass}>
                        <Link to={`/admin/products/edit/${product.id}`}>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            className={cn("size-8 bg-background", adminGhostButtonClass)}
                            aria-label="Sửa"
                          >
                            <Pencil className="size-3.5" strokeWidth={1.75} />
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className={cn(
                            "size-8 border-destructive/30 bg-background text-destructive hover:bg-destructive/5",
                            adminGhostButtonClass
                          )}
                          aria-label="Xóa"
                          onClick={() => {
                            setSelectedProductId(product.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="size-3.5" strokeWidth={1.75} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </AdminWorkspaceBody>

        <AdminWorkspaceFooter>
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            pageSize={ADMIN_PAGE_SIZE}
            onPageChange={setCurrentPage}
            itemLabel="sản phẩm"
          />
        </AdminWorkspaceFooter>
      </AdminWorkspace>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              SPU và toàn bộ SKU liên quan sẽ bị xóa. Thao tác không hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
