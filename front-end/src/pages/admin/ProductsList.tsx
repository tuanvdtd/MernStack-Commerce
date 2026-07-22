import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { useAdminStore } from "~/stores/adminStore"
import {
  deleteProduct as deleteProductApi,
  fetchProducts,
  getProductApiError,
} from "~/apis/productApi"
import { fetchCategories } from "~/apis/categoryApi"
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
import type { AdminCategory } from "~/types/admin/index"

export function ProductsList() {
  const { products, setProducts, deleteProduct } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<AdminCategory[]>([])

  useEffect(() => {
    let cancelled = false

    const loadProducts = async () => {
      setIsLoading(true)
      try {
        const [productData, categoryData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ])
        if (!cancelled) {
          setProducts(productData)
          setCategories(categoryData)
        }
      } catch (error) {
        if (!cancelled) toast.error(getProductApiError(error))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadProducts()
    return () => {
      cancelled = true
    }
  }, [setProducts])

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      product.name.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q)
    const matchesCategory =
      categoryFilter === "all" || product.categoryId === categoryFilter
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

  const handleDeleteConfirm = async () => {
    if (!selectedProductId) return
    try {
      await deleteProductApi(selectedProductId)
      deleteProduct(selectedProductId)
      toast.success("Product deleted")
    } catch (error) {
      toast.error(getProductApiError(error))
    } finally {
      setDeleteDialogOpen(false)
      setSelectedProductId(null)
    }
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
          title="Products"
          description="SPU list in the store catalog."
          actions={
            <Link to="/admin/products/create">
              <Button size="sm" className={cn("gap-1.5", adminBrandButtonClass)}>
                <Plus className="size-3.5" strokeWidth={2} />
                Add SPU
              </Button>
            </Link>
          }
        />

        <AdminMetricStrip
          metrics={[
            { label: "Total SPU", value: products.length },
            {
              label: "Active",
              value: products.filter((p) => p.isActive).length,
              tone: "success",
            },
            {
              label: "Hidden",
              value: products.filter((p) => !p.isActive).length,
            },
            {
              label: "Low stock",
              value: products.filter((p) => p.totalStock < 10).length,
              tone: "warning",
            },
          ]}
        />

        <AdminFilterRow>
          <AdminFilterSearch label="Keyword">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-brand)]"
                strokeWidth={2}
              />
              <Input
                placeholder="Name, brand..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className={cn("pl-9", adminFilterInputClass)}
              />
            </div>
          </AdminFilterSearch>
          <AdminFilterField label="Category">
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className={cn("w-full", adminFilterInputClass)}>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminFilterField>
          <AdminFilterField label="Status">
            <Select
              value={activeFilter}
              onValueChange={(v) => {
                setActiveFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className={cn("w-full", adminFilterInputClass)}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </AdminFilterField>
        </AdminFilterRow>

        <AdminWorkspaceBody>
          <Table>
            <TableHeader>
              <TableRow className={cn("hover:bg-transparent", adminDividerClass)}>
                <TableHead className={adminThClass}>Product</TableHead>
                <TableHead className={adminThClass}>Category</TableHead>
                <TableHead className={adminThClass}>SKU</TableHead>
                <TableHead className={adminThClass}>Price</TableHead>
                <TableHead className={adminThClass}>Stock</TableHead>
                <TableHead className={adminThClass}>Status</TableHead>
                <TableHead className={cn(adminThClass, "text-right")}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="p-0">
                    <AdminEmptyState
                      icon={Package}
                      title="No products found"
                      description={
                        hasActiveFilters
                          ? "Try changing filters or search keywords."
                          : "The catalog is empty."
                      }
                      action={
                        hasActiveFilters ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[13px]"
                            onClick={handleClearFilters}
                          >
                            Clear filters
                          </Button>
                        ) : (
                          <Link to="/admin/products/create">
                            <Button size="sm" className={adminBrandButtonClass}>
                              Add SPU
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
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
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
                          to {formatVnd(product.maxPrice)}
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
                        {product.isActive ? "Active" : "Hidden"}
                      </span>
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "text-right")}>
                      <div className={adminRowActionClass}>
                        <Link to={`/admin/products/edit/${product.id}`}>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            className={cn("size-8 bg-background", adminGhostButtonClass)}
                            aria-label="Edit"
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
                          aria-label="Delete"
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
            itemLabel="products"
          />
        </AdminWorkspaceFooter>
      </AdminWorkspace>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              The SPU and all related SKUs will be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
