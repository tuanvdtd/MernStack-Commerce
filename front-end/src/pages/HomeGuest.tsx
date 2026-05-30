import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Zap,
  TrendingUp,
  Star,
  ShieldCheck,
  Truck,
  ChevronRight,
  Eye,
  Timer,
  Flame,
  Gift,
  Search,
  SlidersHorizontal,
  LogIn,
  UserPlus,
  MapPin,
  CheckCircle2,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { ProductQuickViewDialog, type QuickViewProduct } from "~/components/ProductQuickViewDialog";
import { categories, allProducts } from "~/mock/productData";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const flashSaleProducts = allProducts.slice(0, 4);

type SortKey = "popular" | "price-asc" | "price-desc" | "rating";

export function HomeGuest() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("popular");
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });

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

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  const openQuickView = (product: QuickViewProduct) => setQuickViewProduct(product);

  return (
    <div className="min-h-screen bg-background">
      {/* Guest CTA strip */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm text-center">
          <span>
            Bạn đang xem với tư cách <strong>khách</strong> — không cần đăng nhập để duyệt sản phẩm
          </span>
          <span className="hidden sm:inline text-white/60">|</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" className="h-8 rounded-full bg-white text-orange-600 hover:bg-white/90" asChild>
              <Link to="/login">
                <LogIn className="w-3.5 h-3.5 mr-1" /> Đăng nhập
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-full border-white/50 !bg-transparent text-white shadow-none hover:!bg-white/20 hover:!text-white hover:border-white/80"
              asChild
            >
              <Link to="/register">
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Đăng ký
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 pt-10 pb-16">
        <div className="absolute top-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[80px]" />
        <div className="absolute bottom-[-80px] left-[-40px] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[60px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <Badge variant="secondary" className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
            Miễn phí xem &amp; so sánh sản phẩm
          </Badge>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Mua sắm thông minh
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  không cần đăng nhập
                </span>
              </h1>
              <p className="text-lg text-blue-200/80 max-w-lg">
                Duyệt hàng ngàn sản phẩm công nghệ, xem giá, đánh giá và chi tiết — giống Shopee hay Amazon. Đăng nhập khi bạn sẵn sàng mua hàng.
              </p>

              <div className="flex gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm điện thoại, laptop, tai nghe..."
                    className="pl-10 h-12 rounded-full bg-white border-0 shadow-lg"
                  />
                </div>
                <Button
                  size="lg"
                  className="h-12 rounded-full px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25"
                  onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Tìm kiếm
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-blue-200/70">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> Hàng chính hãng
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-cyan-400" /> Giao nhanh 2h
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" /> Toàn quốc
                </span>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img src="/hero-tech.png" alt="Sản phẩm công nghệ" className="w-full h-[360px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                  <p className="text-white font-medium text-sm">12+ sản phẩm đang hiển thị</p>
                  <p className="text-cyan-300 text-xs mt-0.5">Cuộn xuống để khám phá danh mục đầy đủ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Danh mục nổi bật</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link to="/category/all">
                Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group text-left"
              >
                <Card className={`h-full transition-all duration-300 hover:shadow-lg hover:border-cyan-500/30 ${selectedCategory === cat.id ? "ring-2 ring-cyan-500 border-cyan-500/50" : ""}`}>
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <cat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-medium text-xs sm:text-sm">{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground">{cat.count} SP</p>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Flash Sale preview */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Flame className="w-7 h-7 text-red-500" />
              <h2 className="text-2xl font-bold">Flash Sale</h2>
              <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              {[
                String(timeLeft.hours).padStart(2, "0"),
                String(timeLeft.minutes).padStart(2, "0"),
                String(timeLeft.seconds).padStart(2, "0"),
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="bg-foreground text-background font-mono text-sm font-bold px-2 py-1 rounded-md min-w-[36px] text-center">{t}</span>
                  {i < 2 && <span className="font-bold text-muted-foreground">:</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {flashSaleProducts.map((p) => {
              const soldPercent = p.sold && p.stock ? Math.round((p.sold / p.stock) * 100) : 0;
              return (
                <Card key={p.id} className="group flex flex-col overflow-hidden hover:shadow-xl hover:border-cyan-500/30 transition-all pt-0 gap-0 pb-0">
                  <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted/30">
                    <Link to={`/product/${p.id}`} className="absolute inset-0 block">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>
                    <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-500">-{p.discount}%</Badge>
                  </div>
                  <CardContent className="flex flex-col gap-2 p-3">
                    <Link to={`/product/${p.id}`}>
                      <h3 className="text-sm font-medium line-clamp-2 group-hover:text-cyan-600">{p.name}</h3>
                    </Link>
                    <div className="text-lg font-bold text-red-500">{formatPrice(p.price)}</div>
                    {p.sold != null && p.stock != null && (
                      <>
                        <Progress value={soldPercent} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-red-500" />
                        <p className="text-[10px] text-muted-foreground">Đã bán {p.sold}</p>
                      </>
                    )}
                    <Button variant="outline" size="sm" className="w-full rounded-lg" asChild>
                      <Link to={`/product/${p.id}`}>Xem chi tiết</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-6">
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/flash-sale">Xem tất cả Flash Sale <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Product catalog — Shopee-style browse */}
      <section id="catalog" className="py-12 bg-muted/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-cyan-500" />
            <h2 className="text-2xl font-bold">Khám phá sản phẩm</h2>
            <Badge variant="outline" className="ml-auto sm:ml-2">
              {filteredProducts.length} sản phẩm
            </Badge>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar Assistant & Perks replacement */}
            <aside className="lg:col-span-1 space-y-5 lg:sticky lg:top-24 lg:self-start">
              {/* Card 1: Member Perks & Voucher */}
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl shadow-slate-200/40 dark:shadow-none ring-1 ring-white/10 pt-0 gap-0 pb-0">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/25 blur-3xl animate-pulse" />
                <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
                <CardContent className="p-5 relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30">
                      <Gift className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold tracking-wide text-cyan-300 uppercase">Ưu đãi thành viên</h4>
                      <p className="text-[10px] text-slate-300/80 font-medium">Đăng ký để nhận voucher chào mừng</p>
                    </div>
                  </div>

                  {/* Visual Voucher Ticket */}
                  <div className="relative overflow-hidden rounded-xl border border-dashed border-cyan-500/50 bg-cyan-950/40 p-3 text-center">
                    <div className="absolute top-1/2 -left-2.5 h-5 w-5 -translate-y-1/2 rounded-full bg-slate-950 border-r border-dashed border-cyan-500/50" />
                    <div className="absolute top-1/2 -right-2.5 h-5 w-5 -translate-y-1/2 rounded-full bg-slate-950 border-l border-dashed border-cyan-500/50" />
                    <div className="text-[9px] uppercase tracking-widest text-cyan-400 font-bold">VOUCHER CHÀO MỪNG</div>
                    <div className="my-1.5 text-lg font-black text-white leading-none">GIẢM 500.000đ</div>
                    <div className="inline-block rounded-md bg-cyan-500/20 px-2 py-0.5 text-[9px] font-mono text-cyan-300">
                      Mã: WELCOME500
                    </div>
                  </div>

                  {/* Benefits checklist */}
                  <ul className="space-y-2 text-xs text-slate-200/90">
                    {[
                      "Tích điểm 2% mỗi đơn hàng",
                      "Miễn phí vận chuyển toàn quốc",
                      "Hỗ trợ kỹ thuật 24/7 từ chuyên gia",
                      "Đổi trả 1-đổi-1 trong 15 ngày",
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button size="sm" className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 font-semibold shadow-lg shadow-cyan-500/20 group" asChild>
                    <Link to="/register">
                      Đăng ký ngay <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Card 2: Trending Searches (Interactive) */}
              <Card className="border-0 shadow-lg shadow-slate-100 dark:shadow-none ring-1 ring-slate-200/60 dark:ring-border/60">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100 dark:border-border/60">
                    <Search className="h-4 w-4 text-cyan-600" />
                    <h4 className="text-sm font-bold">Xu hướng tìm kiếm</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { text: "iPhone 15 Pro", query: "iPhone 15" },
                      { text: "MacBook M3", query: "MacBook" },
                      { text: "Sony XM5", query: "Sony" },
                      { text: "Galaxy S24", query: "Samsung" },
                      { text: "Apple Watch", query: "Watch" },
                      { text: "Tai nghe", query: "AirPods" },
                    ].map((tag, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSearchQuery(tag.query);
                          document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="rounded-full bg-slate-50 dark:bg-muted/50 px-3 py-1.5 text-xs text-slate-600 dark:text-muted-foreground hover:bg-cyan-50 hover:text-cyan-600 dark:hover:bg-cyan-950/20 dark:hover:text-cyan-300 ring-1 ring-slate-100 dark:ring-transparent transition-all duration-200 font-medium"
                      >
                        🔥 {tag.text}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Product grid */}
            <div className="lg:col-span-3">
              <Card className="mb-4 overflow-hidden border-border/60 p-0 shadow-sm">
                <div className="flex flex-col gap-3 border-b border-border/50 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <SlidersHorizontal className="h-4 w-4 text-cyan-600" />
                    Sắp xếp kết quả
                  </span>
                  <Badge variant="secondary" className="w-fit bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                    {filteredProducts.length} sản phẩm
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 p-3">
                  {(
                    [
                      ["popular", "Phổ biến"],
                      ["price-asc", "Giá thấp"],
                      ["price-desc", "Giá cao"],
                      ["rating", "Đánh giá"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSortBy(key)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${sortBy === key
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Card>

              {filteredProducts.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">Không tìm thấy sản phẩm phù hợp.</p>
                  <Button variant="outline" onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}>
                    Xem tất cả sản phẩm
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-start">
                  {filteredProducts.map((p) => (
                    <Card
                      key={p.id}
                      className="group flex flex-col overflow-hidden hover:shadow-xl hover:border-cyan-500/30 transition-all pt-0 gap-0 pb-0"
                      onMouseEnter={() => setHoveredProduct(p.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted/30">
                        <Link to={`/product/${p.id}`} className="absolute inset-0 block">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </Link>
                        <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-500 text-white text-xs">-{p.discount}%</Badge>
                        <div
                          className={`absolute top-2 right-2 z-10 transition-all duration-300 ${hoveredProduct === p.id ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}`}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white"
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
                      <CardContent className="flex flex-1 flex-col gap-2 p-3">
                        <Link to={`/product/${p.id}`}>
                          <h3 className="text-sm font-medium line-clamp-2 group-hover:text-cyan-600 transition-colors">{p.name}</h3>
                        </Link>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-muted-foreground">{p.rating} ({p.reviews.toLocaleString()})</span>
                        </div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-base font-bold text-red-500">{formatPrice(p.price)}</span>
                          <span className="text-xs text-muted-foreground line-through">{formatPrice(p.originalPrice)}</span>
                        </div>
                        <div className="mt-auto flex gap-2 pt-1">
                          <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs h-8" asChild>
                            <Link to={`/product/${p.id}`}>Chi tiết</Link>
                          </Button>
                          <Button size="sm" className="flex-1 rounded-lg text-xs h-8 bg-gradient-to-r from-cyan-500 to-blue-500" asChild>
                            <Link to="/login" state={{ from: `/product/${p.id}` }}>Mua hàng</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-10 bg-gradient-to-r from-slate-900 via-blue-950 to-cyan-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Miễn phí vận chuyển", desc: "Đơn từ 300K" },
              { icon: ShieldCheck, title: "Chính hãng 100%", desc: "Bảo hành 12 tháng" },
              { icon: Zap, title: "Flash Sale mỗi ngày", desc: "Giảm đến 70%" },
              { icon: Gift, title: "Ưu đãi thành viên", desc: "Sau khi đăng ký" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-blue-200/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductQuickViewDialog
        product={quickViewProduct}
        open={quickViewProduct != null}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </div>
  );
}
