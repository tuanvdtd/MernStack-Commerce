import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminStore } from "~/stores/adminStore";
import type { SPU, SKU } from "~/types/admin/index";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự"),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  brand: z.string().min(1, "Vui lòng nhập thương hiệu"),
  status: z.enum(["active", "inactive", "archived"]),
  images: z.array(z.object({
    url: z.string().url("URL không hợp lệ"),
    alt: z.string(),
    isPrimary: z.boolean()
  })).min(1, "Phải có ít nhất 1 hình ảnh"),
});

const skuSchema = z.object({
  sku: z.string().min(3, "Mã SKU phải có ít nhất 3 ký tự"),
  variants: z.array(z.object({
    name: z.string(),
    value: z.string()
  })).min(1, "Phải có ít nhất 1 biến thể"),
  price: z.number().min(1000, "Giá phải lớn hơn 1000đ"),
  originalPrice: z.number().min(1000, "Giá gốc phải lớn hơn 1000đ"),
  discount: z.number().min(0).max(100),
  stock: z.object({
    available: z.number().min(0),
    reserved: z.number().min(0),
    sold: z.number().min(0)
  }),
  isActive: z.boolean()
});

type ProductFormData = z.infer<typeof productSchema>;
type SKUFormData = z.infer<typeof skuSchema>;

const categories = ["Smartphone", "Laptop", "Tablet", "Audio", "Wearable", "Accessory"];
const brands = ["Apple", "Samsung", "Sony", "LG", "Xiaomi", "Huawei", "Dell", "HP", "Asus", "Lenovo"];

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, addProduct, updateProduct } = useAdminStore();
  const [skus, setSkus] = useState<SKUFormData[]>([]);
  const isEditMode = !!id;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      brand: "",
      status: "active",
      images: [{ url: "", alt: "", isPrimary: true }]
    }
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images"
  });

  useEffect(() => {
    if (isEditMode && id) {
      const product = products.find(p => p.id === id);
      if (product) {
        form.reset({
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand,
          status: product.status,
          images: product.images
        });
        setSkus(product.skus.map(sku => ({
          sku: sku.sku,
          variants: sku.variants,
          price: sku.price,
          originalPrice: sku.originalPrice,
          discount: sku.discount,
          stock: sku.stock,
          isActive: sku.isActive
        })));
      }
    }
  }, [isEditMode, id, products, form]);

  const addNewSKU = () => {
    setSkus([...skus, {
      sku: "",
      variants: [{ name: "", value: "" }],
      price: 0,
      originalPrice: 0,
      discount: 0,
      stock: { available: 0, reserved: 0, sold: 0 },
      isActive: true
    }]);
  };

  const removeSKU = (index: number) => {
    setSkus(skus.filter((_, i) => i !== index));
  };

  const updateSKU = (index: number, field: keyof SKUFormData, value: any) => {
    const newSkus = [...skus];
    (newSkus[index] as any)[field] = value;
    setSkus(newSkus);
  };

  const addVariantToSKU = (skuIndex: number) => {
    const newSkus = [...skus];
    newSkus[skuIndex].variants.push({ name: "", value: "" });
    setSkus(newSkus);
  };

  const removeVariantFromSKU = (skuIndex: number, variantIndex: number) => {
    const newSkus = [...skus];
    newSkus[skuIndex].variants = newSkus[skuIndex].variants.filter((_, i) => i !== variantIndex);
    setSkus(newSkus);
  };

  const updateVariant = (skuIndex: number, variantIndex: number, field: 'name' | 'value', value: string) => {
    const newSkus = [...skus];
    newSkus[skuIndex].variants[variantIndex][field] = value;
    setSkus(newSkus);
  };

  const onSubmit = (data: ProductFormData) => {
    if (skus.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 SKU");
      return;
    }

    // Calculate stats
    const totalStock = skus.reduce((sum, sku) => sum + sku.stock.available, 0);
    const minPrice = Math.min(...skus.map(sku => sku.price));
    const maxPrice = Math.max(...skus.map(sku => sku.price));

    const productData: SPU = {
      id: isEditMode && id ? id : `spu-${Date.now()}`,
      name: data.name,
      description: data.description,
      category: data.category,
      brand: data.brand,
      images: data.images,
      status: data.status,
      skus: skus.map((sku, index) => ({
        id: isEditMode && id ? `${id}-sku-${index}` : `sku-${Date.now()}-${index}`,
        spuId: isEditMode && id ? id : `spu-${Date.now()}`,
        sku: sku.sku,
        variants: sku.variants,
        price: sku.price,
        originalPrice: sku.originalPrice,
        discount: sku.discount,
        stock: sku.stock,
        isActive: sku.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      totalStock,
      minPrice,
      maxPrice,
      createdAt: isEditMode && id ? products.find(p => p.id === id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isEditMode && id) {
      updateProduct(id, productData);
      toast.success("Đã cập nhật sản phẩm thành công");
    } else {
      addProduct(productData);
      toast.success("Đã thêm sản phẩm thành công");
    }

    navigate("/admin/products");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? "Cập nhật thông tin sản phẩm" : "Tạo sản phẩm mới cho hệ thống"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList>
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="images">Hình ảnh</TabsTrigger>
              <TabsTrigger value="skus">SKU & Biến thể</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin sản phẩm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên sản phẩm *</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: iPhone 15 Pro Max" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Mô tả chi tiết về sản phẩm..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Danh mục *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn danh mục" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thương hiệu *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn thương hiệu" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brands.map(brand => (
                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Hoạt động</SelectItem>
                            <SelectItem value="inactive">Tạm dừng</SelectItem>
                            <SelectItem value="archived">Lưu trữ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Hình ảnh sản phẩm</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendImage({ url: "", alt: "", isPrimary: false })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm ảnh
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {imageFields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start p-4 border rounded-lg">
                      <div className="flex-1 space-y-4">
                        <FormField
                          control={form.control}
                          name={`images.${index}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL ảnh {index === 0 && "(Ảnh chính)"}</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`images.${index}.alt`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mô tả ảnh</FormLabel>
                              <FormControl>
                                <Input placeholder="Mô tả..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {imageFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SKUs Tab */}
            <TabsContent value="skus" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>SKU & Biến thể</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Thêm các biến thể sản phẩm (màu sắc, dung lượng, ...)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewSKU}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm SKU
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {skus.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Chưa có SKU nào. Nhấn "Thêm SKU" để bắt đầu.
                    </p>
                  ) : (
                    skus.map((sku, skuIndex) => (
                      <div key={skuIndex} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">SKU #{skuIndex + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSKU(skuIndex)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Mã SKU *</label>
                            <Input
                              value={sku.sku}
                              onChange={(e) => updateSKU(skuIndex, 'sku', e.target.value)}
                              placeholder="VD: IP15PM-BK-256"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">Trạng thái</label>
                            <Select
                              value={sku.isActive.toString()}
                              onValueChange={(val) => updateSKU(skuIndex, 'isActive', val === 'true')}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Hoạt động</SelectItem>
                                <SelectItem value="false">Tạm dừng</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Variants */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Biến thể</label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => addVariantToSKU(skuIndex)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Thêm biến thể
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {sku.variants.map((variant, variantIndex) => (
                              <div key={variantIndex} className="flex gap-2">
                                <Input
                                  placeholder="Tên (VD: Màu sắc)"
                                  value={variant.name}
                                  onChange={(e) => updateVariant(skuIndex, variantIndex, 'name', e.target.value)}
                                />
                                <Input
                                  placeholder="Giá trị (VD: Đen)"
                                  value={variant.value}
                                  onChange={(e) => updateVariant(skuIndex, variantIndex, 'value', e.target.value)}
                                />
                                {sku.variants.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVariantFromSKU(skuIndex, variantIndex)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">Giá bán (đ) *</label>
                            <Input
                              type="number"
                              value={sku.price}
                              onChange={(e) => updateSKU(skuIndex, 'price', Number(e.target.value))}
                              placeholder="29990000"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Giá gốc (đ) *</label>
                            <Input
                              type="number"
                              value={sku.originalPrice}
                              onChange={(e) => updateSKU(skuIndex, 'originalPrice', Number(e.target.value))}
                              placeholder="34990000"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Giảm giá (%)</label>
                            <Input
                              type="number"
                              value={sku.discount}
                              onChange={(e) => updateSKU(skuIndex, 'discount', Number(e.target.value))}
                              placeholder="15"
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>

                        {/* Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">Tồn kho *</label>
                            <Input
                              type="number"
                              value={sku.stock.available}
                              onChange={(e) => updateSKU(skuIndex, 'stock', { 
                                ...sku.stock, 
                                available: Number(e.target.value) 
                              })}
                              placeholder="100"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Đã đặt trước</label>
                            <Input
                              type="number"
                              value={sku.stock.reserved}
                              onChange={(e) => updateSKU(skuIndex, 'stock', { 
                                ...sku.stock, 
                                reserved: Number(e.target.value) 
                              })}
                              placeholder="5"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Đã bán</label>
                            <Input
                              type="number"
                              value={sku.stock.sold}
                              onChange={(e) => updateSKU(skuIndex, 'stock', { 
                                ...sku.stock, 
                                sold: Number(e.target.value) 
                              })}
                              placeholder="50"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-[#0ACDFF] hover:bg-[#0ACDFF]/90">
              {isEditMode ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
