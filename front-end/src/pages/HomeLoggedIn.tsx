import { Link } from "react-router";
import { useEffect, useState } from "react";
import {
  Smartphone, Laptop, Watch, Headphones, Tablet, Monitor,
  Zap, TrendingUp, Star, ShieldCheck, Truck, ArrowRight,
  ChevronRight, Heart, Eye, Timer, Flame, Gift, Sparkles
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { ProductQuickViewDialog, type QuickViewProduct } from "~/components/ProductQuickViewDialog";
import { userStore } from "~/stores/userStore";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const flashSaleProducts = [
  { id: "1", name: "iPhone 15 Pro Max 256GB", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80", price: 25990000, originalPrice: 34990000, discount: 26, sold: 156, stock: 200 },
  { id: "2", name: "Samsung Galaxy S24 Ultra", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80", price: 29990000, originalPrice: 35990000, discount: 17, sold: 89, stock: 150 },
  { id: "3", name: "Xiaomi 14 Pro 5G", image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80", price: 18990000, originalPrice: 24990000, discount: 24, sold: 203, stock: 250 },
  { id: "4", name: "MacBook Pro M3 14 inch", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", price: 39990000, originalPrice: 49990000, discount: 20, sold: 67, stock: 100 },
];

const categories = [
  { id: 1, name: "Điện thoại", icon: Smartphone, color: "from-blue-500 to-cyan-400", count: 234 },
  { id: 2, name: "Laptop", icon: Laptop, color: "from-violet-500 to-purple-400", count: 156 },
  { id: 3, name: "Đồng hồ thông minh", icon: Watch, color: "from-emerald-500 to-teal-400", count: 89 },
  { id: 4, name: "Tai nghe", icon: Headphones, color: "from-orange-500 to-amber-400", count: 312 },
  { id: 5, name: "Máy tính bảng", icon: Tablet, color: "from-pink-500 to-rose-400", count: 78 },
  { id: 6, name: "Màn hình", icon: Monitor, color: "from-indigo-500 to-blue-400", count: 45 },
];

const trendingProducts = [
  { id: "5", name: "AirPods Pro 2nd Gen", image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80", price: 5990000, originalPrice: 6990000, discount: 14, rating: 4.8, reviews: 1240 },
  { id: "6", name: "Dell XPS 13 Plus", image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&q=80", price: 35990000, originalPrice: 41990000, discount: 14, rating: 4.7, reviews: 856 },
  { id: "7", name: "Apple Watch Ultra 2", image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&q=80", price: 19990000, originalPrice: 23990000, discount: 17, rating: 4.9, reviews: 2103 },
  { id: "8", name: "iPad Air M2 11 inch", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80", price: 15990000, originalPrice: 18990000, discount: 16, rating: 4.6, reviews: 634 },
  { id: "9", name: "Sony WH-1000XM5", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80", price: 7990000, originalPrice: 8990000, discount: 11, rating: 4.8, reviews: 1890 },
  { id: "10", name: "Galaxy Tab S9 FE", image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&q=80", price: 9990000, originalPrice: 12990000, discount: 23, rating: 4.5, reviews: 423 },
  { id: "11", name: "MacBook Air M3 15\"", image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80", price: 32990000, originalPrice: 37990000, discount: 13, rating: 4.9, reviews: 1567 },
  { id: "12", name: "Google Pixel Watch 2", image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80", price: 8490000, originalPrice: 9990000, discount: 15, rating: 4.4, reviews: 312 },
];

const banners = [
  { title: "Smart Watch Collection", subtitle: "Giảm đến 40%", image: "/promo-smartwatch.png", color: "from-slate-900 via-blue-950 to-cyan-900" },
  { title: "Laptop Cao Cấp", subtitle: "Trả góp 0%", image: "/promo-laptop.png", color: "from-zinc-900 via-violet-950 to-purple-900" },
];

export function HomeLoggedIn() {
  const user = userStore((s) => s.user);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);

  const openQuickView = (product: QuickViewProduct) => setQuickViewProduct(product);
  const handleQuickViewOpenChange = (open: boolean) => {
    if (!open) setQuickViewProduct(null);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Chào buổi sáng";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 pt-12 pb-20">
        {/* Animated background blobs */}
        <div className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-100px] left-[-60px] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/5 blur-[120px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Greeting bar */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-100">
                {greeting()}, <span className="font-semibold text-white">{user?.name || "bạn"}</span>! 👋
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="secondary" className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30">
                  <Zap className="w-3 h-3 mr-1" /> Ưu đãi độc quyền thành viên
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                  Thiết bị thông minh
                  <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    cho cuộc sống hiện đại
                  </span>
                </h1>
                <p className="mt-4 text-lg text-blue-200/80 max-w-lg leading-relaxed">
                  Khám phá bộ sưu tập điện thoại, laptop, smartwatch mới nhất với giá ưu đãi lên đến <span className="text-cyan-300 font-semibold">70%</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/25 rounded-full px-8 h-12 text-base" asChild>
                  <Link to="/flash-sale">
                    <Flame className="w-4 h-4 mr-2" /> Săn Flash Sale
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white backdrop-blur rounded-full px-8 h-12 text-base" asChild>
                  <Link to="/category/all">
                    Khám phá ngay <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                {[
                  { label: "Sản phẩm", value: "10K+" },
                  { label: "Khách hàng", value: "50K+" },
                  { label: "Đánh giá 5★", value: "25K+" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-sm text-blue-300/70">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10">
                <img src="/hero-tech.png" alt="Smart Devices" className="w-full h-[480px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                {/* Floating card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Voucher thành viên mới</p>
                        <p className="text-cyan-300 text-xs">Giảm 500K cho đơn từ 2 triệu</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-full text-xs h-8">
                      Nhận ngay
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Danh mục sản phẩm</h2>
            <Button variant="ghost" className="text-muted-foreground" asChild>
              <Link to="/category/all">Xem tất cả <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.id}`}>
                <Card className="group hover:shadow-lg hover:shadow-cyan-500/5 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <cat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{cat.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{cat.count} sản phẩm</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Separator />

      {/* ===== FLASH SALE ===== */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Zap className="w-7 h-7 text-red-500" />
                  <div className="absolute inset-0 animate-ping">
                    <Zap className="w-7 h-7 text-red-500/40" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Flash Sale</h2>
              </div>
              <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
            </div>

            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-1">
                {[
                  String(timeLeft.hours).padStart(2, "0"),
                  String(timeLeft.minutes).padStart(2, "0"),
                  String(timeLeft.seconds).padStart(2, "0"),
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="bg-foreground text-background font-mono text-lg font-bold px-3 py-1.5 rounded-lg min-w-[44px] text-center">
                      {t}
                    </div>
                    {i < 2 && <span className="text-xl font-bold text-muted-foreground">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {flashSaleProducts.map((p) => {
              const soldPercent = Math.round((p.sold / p.stock) * 100);
              return (
                <Card
                  key={p.id}
                  className="group overflow-hidden border-border/50 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 h-full pt-0 gap-0 pb-0"
                  onMouseEnter={() => setHoveredProduct(p.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                    <div className="relative aspect-square overflow-hidden bg-muted/30">
                      <Link to={`/product/${p.id}`} className="block h-full w-full">
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </Link>
                      <Badge className="absolute top-3 left-3 z-10 bg-red-500 hover:bg-red-500 text-white font-bold pointer-events-none">
                        -{p.discount}%
                      </Badge>
                      {/* Quick actions */}
                      <div className={`absolute top-3 right-3 z-10 flex flex-col gap-2 transition-all duration-300 ${hoveredProduct === p.id ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                              >
                                <Heart className="w-4 h-4 text-gray-600" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Yêu thích</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                                onClick={() => openQuickView(p)}
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Xem nhanh</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <Link to={`/product/${p.id}`}>
                        <h3 className="font-medium text-sm line-clamp-2 min-h-[40px] group-hover:text-cyan-600 transition-colors">{p.name}</h3>
                      </Link>
                      <div className="space-y-1">
                        <div className="text-xl font-bold text-red-500">{formatPrice(p.price)}</div>
                        <div className="text-sm text-muted-foreground line-through">{formatPrice(p.originalPrice)}</div>
                      </div>
                      <div className="space-y-1.5">
                        <Progress value={soldPercent} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-red-500" />
                        <p className="text-xs text-muted-foreground">Đã bán {p.sold}/{p.stock}</p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg" size="sm" asChild>
                        <Link to={`/product/${p.id}`}>Mua ngay</Link>
                      </Button>
                    </CardContent>
                  </Card>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
              <Link to="/flash-sale">
                Xem tất cả Flash Sale <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <Separator />

      {/* ===== PROMO BANNERS ===== */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {banners.map((b, i) => (
              <Link key={i} to="/flash-sale">
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 pt-0 gap-0 pb-0">
                  <div className={`relative h-56 bg-gradient-to-r ${b.color} overflow-hidden`}>
                    <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-60 transition-all duration-500" />
                    <div className="relative z-10 h-full flex flex-col justify-center p-8">
                      <Badge className="w-fit mb-3 bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30">
                        Hot Deal
                      </Badge>
                      <h3 className="text-3xl font-bold text-white mb-1">{b.title}</h3>
                      <p className="text-lg text-white/80">{b.subtitle}</p>
                      <Button variant="secondary" size="sm" className="w-fit mt-4 rounded-full">
                        Xem ngay <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST BANNER ===== */}
      <section className="py-12 bg-gradient-to-r from-slate-900 via-blue-950 to-cyan-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Miễn phí vận chuyển", desc: "Đơn hàng từ 300K" },
              { icon: ShieldCheck, title: "Bảo hành chính hãng", desc: "12 tháng toàn quốc" },
              { icon: Zap, title: "Giao hàng nhanh", desc: "Trong 2h nội thành" },
              { icon: Gift, title: "Ưu đãi thành viên", desc: "Tích điểm đổi quà" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-blue-200/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRENDING PRODUCTS ===== */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-cyan-500" />
              <h2 className="text-3xl font-bold tracking-tight">Xu hướng mua sắm</h2>
            </div>
            <Button variant="ghost" className="text-muted-foreground" asChild>
              <Link to="/category/trending">Xem thêm <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trendingProducts.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`}>
                <Card className="group overflow-hidden hover:shadow-xl hover:shadow-cyan-500/5 hover:border-cyan-500/30 transition-all duration-300 h-full pt-0 gap-0 pb-0">
                  <div className="relative aspect-square overflow-hidden bg-muted/30">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <Badge className="absolute top-3 left-3 bg-emerald-500 hover:bg-emerald-500 text-white">
                      -{p.discount}%
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2 min-h-[40px] group-hover:text-cyan-600 transition-colors">{p.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(p.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({p.reviews.toLocaleString()})</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-red-500">{formatPrice(p.price)}</span>
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(p.originalPrice)}</span>
                    </div>
                    <Button variant="outline" className="w-full rounded-lg hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-500/30" size="sm">
                      Thêm vào giỏ
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <ProductQuickViewDialog
        product={quickViewProduct}
        open={quickViewProduct != null}
        onOpenChange={handleQuickViewOpenChange}
      />
    </div>
  );
}
