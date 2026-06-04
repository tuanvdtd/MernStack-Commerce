import { useEffect, useState } from "react"
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
import { Badge } from "~/components/ui/badge"
import { Plus, Search, Edit, Trash2, Package } from "lucide-react"
import { toast } from "sonner"
import { AdminPage } from "~/components/admin/AdminPage"
import { AdminPageHeader } from "~/components/admin/AdminPageHeader"
import {
  AdminToolbar,
  AdminToolbarField,
  AdminToolbarSearch,
} from "~/components/admin/AdminToolbar"
import { AdminTableShell } from "~/components/admin/AdminTableShell"
import { AdminPagination } from "~/components/admin/AdminPagination"
import { AdminEmptyState } from "~/components/admin/AdminEmptyState"
import { adminBrandButtonClass, adminBrandTextClass, formatVnd } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"

const ITEMS_PER_PAGE = 10

export function ProductsList() {
  const { products, setProducts, deleteProduct } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  useEffect(() => {
    if (products.length === 0) setProducts(mockProducts)
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

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  const handleDeleteConfirm = () => {
    if (!selectedProductId) return
    deleteProduct(selectedProductId)
    toast.success("Đã xóa sản phẩm")
    setDeleteDialogOpen(false)
    setSelectedProductId(null)
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Sản phẩm (SPU)"
        description={`${filteredProducts.length} sản phẩm trong catalog`}
        actions={
          <Link to="/admin/products/create">
            <Button className={cn("gap-2", adminBrandButtonClass)}>
              <Plus className="size-4" aria-hidden />
              Thêm SPU
            </Button>
          </Link>
        }
      />

      <AdminToolbar>
        <AdminToolbarSearch>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder="Tìm tên, slug, thương hiệu..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>
        </AdminToolbarSearch>
        <AdminToolbarField>
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-full">
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
        </AdminToolbarField>
        <AdminToolbarField>
          <Select
            value={activeFilter}
            onValueChange={(v) => {
              setActiveFilter(v)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang bán</SelectItem>
              <SelectItem value="inactive">Đã ẩn</SelectItem>
            </SelectContent>
          </Select>
        </AdminToolbarField>
      </AdminToolbar>

      <AdminTableShell>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14 px-4">#</TableHead>
              <TableHead className="min-w-[200px] px-4">Sản phẩm</TableHead>
              <TableHead className="px-4">Slug</TableHead>
              <TableHead className="px-4">Danh mục</TableHead>
              <TableHead className="px-4">SKU</TableHead>
              <TableHead className="px-4">Giá</TableHead>
              <TableHead className="px-4">Tồn</TableHead>
              <TableHead className="px-4">Trạng thái</TableHead>
              <TableHead className="px-4 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="p-0">
                  <AdminEmptyState
                    icon={Package}
                    title="Không tìm thấy sản phẩm"
                    description="Thử đổi bộ lọc hoặc thêm SPU mới"
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-3">
                      {product.imgUrl ? (
                        <img
                          src={product.imgUrl}
                          alt=""
                          className="size-11 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex size-11 items-center justify-center rounded-md bg-muted">
                          <Package className="size-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 max-w-[220px]">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {product.brand}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate px-4 font-mono text-xs text-muted-foreground">
                    {product.slug}
                  </TableCell>
                  <TableCell className="px-4 text-sm">
                    {product.categoryName}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground">
                    {product.skus.length} biến thể
                  </TableCell>
                  <TableCell className="px-4">
                    <p
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        adminBrandTextClass
                      )}
                    >
                      {formatVnd(product.minPrice)}
                    </p>
                    {product.minPrice !== product.maxPrice && (
                      <p className="text-xs text-muted-foreground">
                        đến {formatVnd(product.maxPrice)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="px-4">
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        product.totalStock < 10
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-700 dark:text-emerald-400"
                      )}
                    >
                      {product.totalStock}
                    </span>
                  </TableCell>
                  <TableCell className="px-4">
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Đang bán" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Link to={`/admin/products/edit/${product.id}`}>
                        <Button variant="ghost" size="icon-sm" aria-label="Sửa">
                          <Edit className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Xóa"
                        onClick={() => {
                          setSelectedProductId(product.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredProducts.length}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        itemLabel="sản phẩm"
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              SPU và toàn bộ SKU liên quan sẽ bị xóa khỏi danh sách (mock). Thao
              tác không hoàn tác.
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
    </AdminPage>
  )
}
