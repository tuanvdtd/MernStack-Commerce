import { useEffect, useState } from "react"
import { useAdminStore } from "~/stores/adminStore"
import { mockProducts } from "~/mock/adminData"
import { computeProductStats, formatVariantOptions } from "~/lib/admin/productUtils"
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
import { Badge } from "~/components/ui/badge"
import { Search, Package, Edit, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { SKU } from "~/types/admin/index"
import { AdminPage } from "~/components/admin/AdminPage"
import { AdminPageHeader } from "~/components/admin/AdminPageHeader"
import { AdminStatCard, AdminStatGrid } from "~/components/admin/AdminStatCard"
import { AdminToolbar } from "~/components/admin/AdminToolbar"
import { AdminTableShell } from "~/components/admin/AdminTableShell"
import { AdminEmptyState } from "~/components/admin/AdminEmptyState"
import { adminBrandButtonClass, adminBrandTextClass, formatVnd } from "~/lib/admin/ui"
import { cn } from "~/lib/utils"

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

  useEffect(() => {
    if (products.length === 0) setProducts(mockProducts)
  }, [products, setProducts])

  const allSKUs = products.flatMap((product) =>
    product.skus.map((sku) => ({ product, sku }))
  )

  const filteredSKUs = allSKUs.filter(({ product, sku }) => {
    const q = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(q) ||
      sku.sku.toLowerCase().includes(q) ||
      sku.options.some(
        (o) =>
          o.optionName.toLowerCase().includes(q) ||
          o.value.toLowerCase().includes(q)
      )
    )
  })

  const handleUpdateStock = () => {
    if (!selectedSKU) return
    const product = products.find((p) => p.id === selectedSKU.productId)
    if (!product) return
    if (stockQuantity < 0) {
      toast.error("Tồn kho không được âm")
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

    toast.success("Đã cập nhật tồn kho")
    setEditDialogOpen(false)
    setSelectedSKU(null)
  }

  const getStockStatus = (qty: number) => {
    if (qty === 0)
      return {
        label: "Hết hàng",
        variant: "destructive" as const,
        valueClass: "text-red-600 dark:text-red-400",
      }
    if (qty < 10)
      return {
        label: "Sắp hết",
        variant: "secondary" as const,
        valueClass: "text-amber-700 dark:text-amber-300",
      }
    return {
      label: "Ổn định",
      variant: "default" as const,
      valueClass: "text-emerald-700 dark:text-emerald-400",
    }
  }

  const stats = {
    totalItems: allSKUs.length,
    lowStock: allSKUs.filter(({ sku }) => sku.stockQuantity < 10).length,
    outOfStock: allSKUs.filter(({ sku }) => sku.stockQuantity === 0).length,
    totalValue: allSKUs.reduce(
      (sum, { sku }) => sum + sku.stockQuantity * sku.price,
      0
    ),
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Kho hàng (SKU)"
        description="Quản lý stockQuantity theo từng ProductVariant"
      />

      <AdminStatGrid columns={4}>
        <AdminStatCard label="Tổng SKU" value={stats.totalItems} icon={Package} />
        <AdminStatCard
          label="Sắp hết"
          value={stats.lowStock}
          icon={AlertTriangle}
          tone="warning"
        />
        <AdminStatCard
          label="Hết hàng"
          value={stats.outOfStock}
          tone="danger"
        />
        <AdminStatCard
          label="Giá trị kho"
          value={`${(stats.totalValue / 1_000_000_000).toFixed(2)}B`}
          tone="success"
        />
      </AdminStatGrid>

      <AdminToolbar>
        <div className="relative md:col-span-12">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Mã SKU, tên SPU, thuộc tính..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </AdminToolbar>

      <AdminTableShell>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">Mã SKU</TableHead>
              <TableHead className="px-4">SPU</TableHead>
              <TableHead className="px-4">Thuộc tính</TableHead>
              <TableHead className="px-4">Giá</TableHead>
              <TableHead className="px-4">Tồn</TableHead>
              <TableHead className="px-4">Trạng thái</TableHead>
              <TableHead className="px-4 text-right">Sửa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSKUs.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="p-0">
                  <AdminEmptyState icon={Package} title="Không có SKU" />
                </TableCell>
              </TableRow>
            ) : (
              filteredSKUs.map(({ product, sku }) => {
                const stockStatus = getStockStatus(sku.stockQuantity)
                const thumb = sku.imgUrl ?? product.imgUrl

                return (
                  <TableRow key={sku.id}>
                    <TableCell className="px-4 font-mono text-xs">
                      {sku.sku}
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-2.5">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            className="size-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-md bg-muted" />
                        )}
                        <div className="min-w-0 max-w-[160px]">
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="truncate font-mono text-xs text-muted-foreground">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px] px-4 text-xs text-muted-foreground">
                      {formatVariantOptions(sku.options)}
                    </TableCell>
                    <TableCell className="px-4">
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          adminBrandTextClass
                        )}
                      >
                        {formatVnd(sku.price)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4">
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          stockStatus.valueClass
                        )}
                      >
                        {sku.stockQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Sửa tồn kho"
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
                        <Edit className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật tồn kho</DialogTitle>
            <DialogDescription className="font-mono">
              {selectedSKU?.sku.sku}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSKU && (
              <p className="text-sm text-muted-foreground">
                {formatVariantOptions(selectedSKU.sku.options)}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">stockQuantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) =>
                  setStockQuantity(Number(e.target.value) || 0)
                }
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button className={adminBrandButtonClass} onClick={handleUpdateStock}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  )
}
