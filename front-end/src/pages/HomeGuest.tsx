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
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { HomeHeroSection } from "~/components/home/HomeHeroSection";
import { HomeTopCategories } from "~/components/home/HomeTopCategories";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { ProductQuickViewDialog, type QuickViewProduct } from "~/components/ProductQuickViewDialog";
import { allProducts } from "~/mock/productData";

const formatPrice = (price: number) =>
  `${price.toLocaleString("en-US")} VND`;

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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <HomeHeroSection variant="guest" />

      <HomeTopCategories onCategoryClick={handleCategorySelect} />

      <Separator />

      {/* Flash Sale preview */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Flame className="w-7 h-7 text-red-500" />
              <h2 className="text-3xl font-bold tracking-tight">Flash Sale</h2>
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
                        <p className="text-[10px] text-muted-foreground">Sold {p.sold}</p>
                      </>
                    )}
                    <Button variant="outline" size="sm" className="w-full rounded-lg" asChild>
                      <Link to={`/product/${p.id}`}>View details</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-6">
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/flash-sale">View all Flash Sale <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-12 bg-gradient-to-r from-slate-900 via-blue-950 to-cyan-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Free shipping", desc: "Orders from 300K VND" },
              { icon: ShieldCheck, title: "Official warranty", desc: "12 months nationwide" },
              { icon: Zap, title: "Fast delivery", desc: "Within 2 hours in the city" },
              { icon: Gift, title: "Member deals", desc: "Earn points for rewards" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-white">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  <item.icon className="size-6 text-cyan-400" />
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

      {/* Product catalog: marketplace-style browsing. */}
      <section id="catalog" className="scroll-mt-20 bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 flex items-center gap-3">
            <TrendingUp className="size-6 text-cyan-500" />
            <h2 className="text-3xl font-bold tracking-tight">Explore products</h2>
            <Badge variant="outline" className="ml-auto sm:ml-2">
              {filteredProducts.length} products
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
                      <h4 className="text-sm font-bold tracking-wide text-cyan-300 uppercase">Member perks</h4>
                      <p className="text-[10px] text-slate-300/80 font-medium">Sign up to receive a welcome voucher</p>
                    </div>
                  </div>

                  {/* Visual Voucher Ticket */}
                  <div className="relative overflow-hidden rounded-xl border border-dashed border-cyan-500/50 bg-cyan-950/40 p-3 text-center">
                    <div className="absolute top-1/2 -left-2.5 h-5 w-5 -translate-y-1/2 rounded-full bg-slate-950 border-r border-dashed border-cyan-500/50" />
                    <div className="absolute top-1/2 -right-2.5 h-5 w-5 -translate-y-1/2 rounded-full bg-slate-950 border-l border-dashed border-cyan-500/50" />
                    <div className="text-[9px] uppercase tracking-widest text-cyan-400 font-bold">WELCOME VOUCHER</div>
                    <div className="my-1.5 text-lg font-black text-white leading-none">SAVE 500,000 VND</div>
                    <div className="inline-block rounded-md bg-cyan-500/20 px-2 py-0.5 text-[9px] font-mono text-cyan-300">
                      Code: WELCOME500
                    </div>
                  </div>

                  {/* Benefits checklist */}
                  <ul className="space-y-2 text-xs text-slate-200/90">
                    {[
                      "Earn 2% points on every order",
                      "Free nationwide shipping",
                      "24/7 expert technical support",
                      "1-for-1 exchanges within 15 days",
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button size="sm" className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 font-semibold shadow-lg shadow-cyan-500/20 group" asChild>
                    <Link to="/register">
                      Sign up now <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Card 2: Trending Searches (Interactive) */}
              <Card className="border-0 shadow-lg shadow-slate-100 dark:shadow-none ring-1 ring-slate-200/60 dark:ring-border/60">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100 dark:border-border/60">
                    <Search className="h-4 w-4 text-cyan-600" />
                    <h4 className="text-sm font-bold">Trending searches</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { text: "iPhone 15 Pro", query: "iPhone 15" },
                      { text: "MacBook M3", query: "MacBook" },
                      { text: "Sony XM5", query: "Sony" },
                      { text: "Galaxy S24", query: "Samsung" },
                      { text: "Apple Watch", query: "Watch" },
                      { text: "Headphones", query: "AirPods" },
                    ].map((tag, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSearchQuery(tag.query);
                          document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-100 transition-all duration-200 hover:bg-cyan-50 hover:text-cyan-600 dark:bg-muted/50 dark:text-muted-foreground dark:ring-transparent dark:hover:bg-cyan-950/20 dark:hover:text-cyan-300"
                      >
                        <Flame className="size-3 text-red-500" aria-hidden="true" />
                        {tag.text}
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
                    Sort results
                  </span>
                  <Badge variant="secondary" className="w-fit bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                    {filteredProducts.length} products
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 p-3">
                  {(
                    [
                      ["popular", "Popular"],
                      ["price-asc", "Lowest price"],
                      ["price-desc", "Highest price"],
                      ["rating", "Rating"],
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
                  <p className="text-muted-foreground mb-4">No matching products found.</p>
                  <Button variant="outline" onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}>
                    View all products
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
                              <TooltipContent>Quick view</TooltipContent>
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
                          <span className="text-xs text-muted-foreground">{p.rating} ({p.reviews.toLocaleString("en-US")})</span>
                        </div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-base font-bold text-red-500">{formatPrice(p.price)}</span>
                          <span className="text-xs text-muted-foreground line-through">{formatPrice(p.originalPrice)}</span>
                        </div>
                        <div className="mt-auto flex gap-2 pt-1">
                          <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs h-8" asChild>
                            <Link to={`/product/${p.id}`}>Details</Link>
                          </Button>
                          <Button size="sm" className="flex-1 rounded-lg text-xs h-8 bg-gradient-to-r from-cyan-500 to-blue-500" asChild>
                            <Link to="/login" state={{ from: `/product/${p.id}` }}>Buy</Link>
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

      <ProductQuickViewDialog
        product={quickViewProduct}
        open={quickViewProduct != null}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </div>
  );
}
