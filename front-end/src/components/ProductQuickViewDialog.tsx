import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Star, ShieldCheck, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";

export type QuickViewProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  sold?: number;
  stock?: number;
  rating?: number;
  reviews?: number;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

type ProductQuickViewDialogProps = {
  product: QuickViewProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductQuickViewDialog({
  product,
  open,
  onOpenChange,
}: ProductQuickViewDialogProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  const soldPercent =
    product?.sold != null && product?.stock != null
      ? Math.round((product.sold / product.stock) * 100)
      : null;

  const remainingStock =
    product?.stock != null && product?.sold != null
      ? product.stock - product.sold
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl gap-0 overflow-hidden p-0">
        {product && (
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-square md:aspect-auto md:min-h-[360px] bg-muted/30">
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-500 text-white font-bold">
                -{product.discount}%
              </Badge>
            </div>

            <div className="flex flex-col p-6 md:max-h-[min(90vh,520px)] md:overflow-y-auto">
              <DialogTitle className="text-lg font-semibold leading-snug pr-8">
                {product.name}
              </DialogTitle>

              {product.rating != null && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating!)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{product.rating}</span>
                  {product.reviews != null && (
                    <span className="text-sm text-muted-foreground">
                      ({product.reviews.toLocaleString()} đánh giá)
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4 space-y-1">
                <p className="text-2xl font-bold text-red-500">{formatPrice(product.price)}</p>
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              </div>

              {soldPercent != null && product.sold != null && product.stock != null && (
                <div className="mt-4 space-y-1.5">
                  <Progress
                    value={soldPercent}
                    className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-red-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Đã bán {product.sold}/{product.stock}
                    {remainingStock != null && remainingStock > 0 && (
                      <> — còn {remainingStock} sản phẩm</>
                    )}
                  </p>
                </div>
              )}

              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Sản phẩm chính hãng, bảo hành 12 tháng. Miễn phí vận chuyển cho đơn từ 300.000đ.
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-cyan-500" />
                  Giao nhanh 2h
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" />
                  Bảo hành chính hãng
                </span>
              </div>

              <Separator className="my-5" />

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Số lượng</span>
                <div className="flex items-center rounded-lg border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-r-none"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[2.5rem] text-center text-sm font-medium">{quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-l-none"
                    disabled={remainingStock != null && quantity >= remainingStock}
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
                <Button
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
                  onClick={() => onOpenChange(false)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Mua ngay
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/product/${product.id}`} onClick={() => onOpenChange(false)}>
                    Xem chi tiết
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
