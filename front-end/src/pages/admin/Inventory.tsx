import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { useAdminStore } from "~/stores/adminStore"
import { mockProducts } from "~/mock/adminData"
import { computeProductStats, formatVariantLabel, formatVariantOptions } from "~/lib/admin/productUtils"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Label } from "~/components/ui/label"
import { Search, Package, Pencil } from "lucide-react"
import { toast } from "sonner"
import type { SKU } from "~/types/admin/index"
import {
  AdminWorkspace,
  AdminWorkspaceHeader,
  AdminMetricStrip,
  AdminFilterRow,
  AdminFilterSearch,
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

const getStockLabel = (qty: number) => {
  if (qty === 0) return { text: "Out of stock", className: "bg-red-500/10 text-red-700 dark:text-red-300" }
  if (qty < 10) return { text: "Low stock", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" }
  return { text: "Stable", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" }
}

export function Inventory() {
  const { products, setProducts, updateProduct } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedSKU, setSelectedSKU] = useState<{
    productId: string
    skuId: string
    sku: SKU
  } | null>(null)
  const [stockQuantity, setStockQuantity] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (products.length === 0) setProducts(mockProducts)
    const timer = window.setTimeout(() => setIsLoading(false), 280)
    return () => window.clearTimeout(timer)
  }, [products, setProducts])

  const allSKUs = products.flatMap((product) =>
    product.skus.map((sku) => ({ product, sku }))
  )

  const filteredSKUs = allSKUs.filter(({ product, sku }) => {
    const q = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(q) ||
      sku.id.toLowerCase().includes(q) ||
      formatVariantLabel(sku.options, product.optionAxes)
        .toLowerCase()
        .includes(q) ||
      sku.options.some(
        (o) =>
          o.optionName.toLowerCase().includes(q) ||
          o.value.toLowerCase().includes(q)
      )
    )
  })

  const { items: paginatedSKUs, totalPages } = useMemo(
    () => paginate(filteredSKUs, currentPage, ADMIN_PAGE_SIZE),
    [filteredSKUs, currentPage]
  )

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const stats = {
    totalItems: allSKUs.length,
    lowStock: allSKUs.filter(({ sku }) => sku.stockQuantity > 0 && sku.stockQuantity < 10).length,
    outOfStock: allSKUs.filter(({ sku }) => sku.stockQuantity === 0).length,
    totalValue: allSKUs.reduce(
      (sum, { sku }) => sum + sku.stockQuantity * sku.price,
      0
    ),
  }

  const handleUpdateStock = () => {
    if (!selectedSKU) return
    const product = products.find((p) => p.id === selectedSKU.productId)
    if (!product) return
    if (stockQuantity < 0) {
      toast.error("Stock cannot be negative")
      return
    }

    const updatedSKUs = product.skus.map((sku) =>
      sku.id === selectedSKU.skuId
        ? { ...sku, stockQuantity, updatedAt: new Date().toISOString() }
        : sku
    )

    updateProduct(selectedSKU.productId, {
      skus: updatedSKUs,
      ...computeProductStats(updatedSKUs),
    })

    toast.success("Stock updated")
    setEditDialogOpen(false)
    setSelectedSKU(null)
  }

  if (isLoading) return <AdminTableSkeleton />

  return (
    <>
      <AdminWorkspace>
        <AdminWorkspaceHeader
          title="Inventory"
          description="Stock by SKU variant."
        />

        <AdminMetricStrip
          metrics={[
            { label: "Total SKU", value: stats.totalItems },
            { label: "Low stock", value: stats.lowStock, tone: "warning" },
            { label: "Out of stock", value: stats.outOfStock, tone: "danger" },
            {
              label: "Inventory value",
              value: `${(stats.totalValue / 1_000_000_000).toFixed(2)}B`,
              tone: "brand",
            },
          ]}
        />

        <AdminFilterRow title="Search SKU">
          <AdminFilterSearch label="Keyword" className="lg:max-w-lg">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-brand)]"
                strokeWidth={2}
              />
              <Input
                placeholder="Variant id, SPU name, attributes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className={cn("pl-9", adminFilterInputClass)}
              />
            </div>
          </AdminFilterSearch>
        </AdminFilterRow>

        <AdminWorkspaceBody>
          <Table>
            <TableHeader>
              <TableRow className={cn("hover:bg-transparent", adminDividerClass)}>
                <TableHead className={adminThClass}>Variant</TableHead>
                <TableHead className={adminThClass}>SPU</TableHead>
                <TableHead className={adminThClass}>Attributes</TableHead>
                <TableHead className={adminThClass}>Price</TableHead>
                <TableHead className={adminThClass}>Stock</TableHead>
                <TableHead className={adminThClass}>Status</TableHead>
                <TableHead className={cn(adminThClass, "text-right")}>Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSKUs.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="p-0">
                    <AdminEmptyState
                      icon={Package}
                      title="No SKUs"
                      description={
                        searchQuery
                          ? "Try changing the search keyword."
                          : "No variants in inventory yet."
                      }
                      action={
                        searchQuery ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[13px]"
                            onClick={() => setSearchQuery("")}
                          >
                            Clear search
                          </Button>
                        ) : (
                          <Link to="/admin/products">
                            <Button size="sm" className={adminBrandButtonClass}>
                              Go to products
                            </Button>
                          </Link>
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSKUs.map(({ product, sku }) => {
                  const stock = getStockLabel(sku.stockQuantity)
                  const thumb = sku.imgUrl ?? product.imgUrl

                  return (
                    <TableRow
                      key={sku.id}
                      className={cn("group", adminDividerClass)}
                    >
                      <TableCell className={cn(adminTdClass, "font-medium text-foreground")}>
                        <span className="block text-[13px]">
                          {formatVariantLabel(sku.options, product.optionAxes)}
                        </span>
                        <span className={cn(adminMonoClass, "text-[11px] text-muted-foreground")}>
                          {sku.id}
                        </span>
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <div className="flex items-center gap-2.5">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="size-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="size-8 rounded-lg bg-muted" />
                          )}
                          <div className="min-w-0 max-w-[180px]">
                            <p className="truncate font-medium">{product.name}</p>
                            <p className={cn("truncate", adminMonoClass)}>
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={cn(adminTdClass, "max-w-[220px] text-[12px] text-muted-foreground")}>
                        {formatVariantOptions(sku.options)}
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <span className={cn("font-mono font-medium", adminBrandTextClass)}>
                          {formatVnd(sku.price)}
                        </span>
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <span className="font-mono font-medium">{sku.stockQuantity}</span>
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium",
                            stock.className
                          )}
                        >
                          {stock.text}
                        </span>
                      </TableCell>
                      <TableCell className={cn(adminTdClass, "text-right")}>
                        <div className={adminRowActionClass}>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className={cn("size-8 bg-background", adminGhostButtonClass)}
                            aria-label="Edit stock"
                            onClick={() => {
                              setSelectedSKU({
                                productId: product.id,
                                skuId: sku.id,
                                sku,
                              })
                              setStockQuantity(sku.stockQuantity)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="size-3.5" strokeWidth={1.75} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </AdminWorkspaceBody>

        <AdminWorkspaceFooter>
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSKUs.length}
            pageSize={ADMIN_PAGE_SIZE}
            onPageChange={setCurrentPage}
            itemLabel="SKU"
          />
        </AdminWorkspaceFooter>
      </AdminWorkspace>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update stock</DialogTitle>
            <DialogDescription>
              {selectedSKU
                ? formatVariantLabel(
                    selectedSKU.sku.options,
                    selectedSKU.product.optionAxes
                  )
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSKU && (
              <p className="rounded-lg bg-muted/50 px-3 py-2 text-[13px] text-muted-foreground">
                {formatVariantOptions(selectedSKU.sku.options)}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="stockQuantity" className="text-[13px]">
                Stock quantity
              </Label>
              <Input
                id="stockQuantity"
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value) || 0)}
                className="h-9 font-mono text-[13px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className={adminGhostButtonClass}
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button className={adminBrandButtonClass} onClick={handleUpdateStock}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
