import { useEffect, useState } from "react";
import { useAdminStore } from "~/stores/adminStore";
import { mockProducts } from "~/mock/adminData";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Search, Package, Edit, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { type SKU } from "~/types/admin/index";

export function Inventory() {
  const { products, setProducts, updateProduct } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSKU, setSelectedSKU] = useState<{ productId: string; skuId: string; sku: SKU } | null>(null);
  const [stockUpdate, setStockUpdate] = useState({ available: 0, reserved: 0 });

  useEffect(() => {
    if (products.length === 0) {
      setProducts(mockProducts);
    }
  }, [products, setProducts]);

  // Flatten all SKUs from all products
  const allSKUs = products.flatMap(product => 
    product.skus.map(sku => ({
      product,
      sku
    }))
  );

  // Filter SKUs
  const filteredSKUs = allSKUs.filter(({ product, sku }) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.variants.some(v => v.value.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleEditClick = (productId: string, skuId: string, sku: SKU) => {
    setSelectedSKU({ productId, skuId, sku });
    setStockUpdate({
      available: sku.stock.available,
      reserved: sku.stock.reserved
    });
    setEditDialogOpen(true);
  };

  const handleUpdateStock = () => {
    if (!selectedSKU) return;

    const product = products.find(p => p.id === selectedSKU.productId);
    if (!product) return;

    const updatedSKUs = product.skus.map(sku => {
      if (sku.id === selectedSKU.skuId) {
        return {
          ...sku,
          stock: {
            ...sku.stock,
            available: stockUpdate.available,
            reserved: stockUpdate.reserved
          }
        };
      }
      return sku;
    });

    const totalStock = updatedSKUs.reduce((sum, sku) => sum + sku.stock.available, 0);

    updateProduct(selectedSKU.productId, {
      skus: updatedSKUs,
      totalStock
    });

    toast.success("Đã cập nhật tồn kho thành công");
    setEditDialogOpen(false);
    setSelectedSKU(null);
  };

  const getStockStatus = (available: number) => {
    if (available === 0) {
      return { label: "Hết hàng", variant: "destructive" as const, color: "text-red-600" };
    }
    if (available < 10) {
      return { label: "Sắp hết", variant: "secondary" as const, color: "text-orange-600" };
    }
    if (available < 50) {
      return { label: "Còn ít", variant: "secondary" as const, color: "text-yellow-600" };
    }
    return { label: "Còn hàng", variant: "default" as const, color: "text-green-600" };
  };

  // Calculate stats
  const stats = {
    totalItems: allSKUs.length,
    lowStock: allSKUs.filter(({ sku }) => sku.stock.available < 10).length,
    outOfStock: allSKUs.filter(({ sku }) => sku.stock.available === 0).length,
    totalValue: allSKUs.reduce((sum, { sku }) => sum + (sku.stock.available * sku.price), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý kho</h1>
        <p className="text-gray-600 mt-1">Quản lý tồn kho tất cả các SKU</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng SKU</p>
                <p className="text-2xl font-bold mt-1">{stats.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sắp hết hàng</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Hết hàng</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{stats.outOfStock}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Tổng giá trị kho</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {(stats.totalValue / 1000000000).toFixed(2)}B
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm SKU, sản phẩm, biến thể..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Đã đặt</TableHead>
                  <TableHead>Đã bán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSKUs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      Không tìm thấy SKU nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSKUs.map(({ product, sku }) => {
                    const stockStatus = getStockStatus(sku.stock.available);
                    
                    return (
                      <TableRow key={sku.id}>
                        <TableCell className="font-mono text-xs">{sku.sku}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img
                              src={product.images[0]?.url}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="max-w-[150px]">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.brand}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {sku.variants.map((variant, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="text-gray-600">{variant.name}:</span>{" "}
                                <span className="font-medium">{variant.value}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-semibold text-[#0ACDFF]">
                              {sku.price.toLocaleString()}đ
                            </p>
                            {sku.discount > 0 && (
                              <p className="text-xs text-gray-500 line-through">
                                {sku.originalPrice.toLocaleString()}đ
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${stockStatus.color}`}>
                            {sku.stock.available}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">{sku.stock.reserved}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">{sku.stock.sold}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(product.id, sku.id, sku)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Stock Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật tồn kho</DialogTitle>
            <DialogDescription>
              SKU: {selectedSKU?.sku.sku}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="available">Tồn kho khả dụng</Label>
              <Input
                id="available"
                type="number"
                value={stockUpdate.available}
                onChange={(e) => setStockUpdate({ ...stockUpdate, available: Number(e.target.value) })}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="reserved">Đã đặt trước</Label>
              <Input
                id="reserved"
                type="number"
                value={stockUpdate.reserved}
                onChange={(e) => setStockUpdate({ ...stockUpdate, reserved: Number(e.target.value) })}
                min="0"
              />
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Số lượng đã bán: {selectedSKU?.sku.stock.sold || 0}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleUpdateStock}
              className="bg-[#0ACDFF] hover:bg-[#0ACDFF]/90"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
