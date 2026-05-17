import { useState } from "react";
import { Link } from "react-router";
import {
  User, Package, Heart, MapPin, CreditCard, Settings, LogOut,
  Camera, Shield, Bell, Mail, Phone, Calendar, ChevronRight,
  Truck, CheckCircle2, Clock, ShoppingBag, Pencil, Trash2, Plus, Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Progress } from "~/components/ui/progress";

export function AccountV2() {
  const [activeTab, setActiveTab] = useState("profile");

  const user = {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0901234567",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
    joinDate: "15/01/2024",
    memberLevel: "Gold",
    totalOrders: 24,
    totalSpent: 128500000,
  };

  const orders = [
    {
      id: "FLB2026040412345",
      date: "01/04/2026",
      status: "shipping",
      statusText: "Đang giao hàng",
      total: 44970000,
      items: 3,
      image: "https://images.unsplash.com/photo-1673718424704-51d0d2ca1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      progress: 65,
    },
    {
      id: "FLB2026032398765",
      date: "23/03/2026",
      status: "delivered",
      statusText: "Đã giao hàng",
      total: 15990000,
      items: 1,
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      progress: 100,
    },
    {
      id: "FLB2026031556789",
      date: "15/03/2026",
      status: "completed",
      statusText: "Hoàn thành",
      total: 8990000,
      items: 2,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      progress: 100,
    },
  ];

  const wishlist = [
    {
      id: "13",
      name: "ASUS ROG Zephyrus G14 - Gaming Laptop",
      image: "https://images.unsplash.com/photo-1606625000171-fa7d471da28c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 42990000,
      originalPrice: 52990000,
      discount: 19,
      rating: 4.8,
    },
    {
      id: "14",
      name: "Samsung Galaxy Buds2 Pro",
      image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 4490000,
      originalPrice: 5490000,
      discount: 18,
      rating: 4.5,
    },
  ];

  const addresses = [
    { id: 1, label: "Nhà riêng", name: "Nguyễn Văn A", phone: "0901234567", address: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh", isDefault: true },
    { id: 2, label: "Văn phòng", name: "Nguyễn Văn A", phone: "0901234567", address: "456 Lê Văn Việt, Quận 9, TP. Hồ Chí Minh", isDefault: false },
  ];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const statusConfig: Record<string, { icon: typeof Truck; color: string; bg: string }> = {
    shipping: { icon: Truck, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    delivered: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    completed: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  };

  const sidebarItems = [
    { id: "profile", label: "Thông tin cá nhân", icon: User },
    { id: "orders", label: "Đơn hàng", icon: Package, count: orders.length },
    { id: "wishlist", label: "Yêu thích", icon: Heart, count: wishlist.length },
    { id: "addresses", label: "Địa chỉ", icon: MapPin },
    { id: "payment", label: "Thanh toán", icon: CreditCard },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile Card */}
            <Card className="overflow-visible">
              <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
                <div className="relative mb-4 group">
                  <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
                <h2 className="font-semibold text-slate-900 text-base">{user.name}</h2>
                <p className="text-slate-500 text-sm mb-3">{user.email}</p>
                <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0 px-3 py-0.5 text-xs font-semibold shadow-sm">
                  ⭐ Thành viên {user.memberLevel}
                </Badge>
              </CardContent>
              {/* <Separator />
              <div className="grid grid-cols-2 divide-x">
                <div className="py-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{user.totalOrders}</p>
                  <p className="text-xs text-slate-500">Đơn hàng</p>
                </div>
                <div className="py-3 text-center">
                  <p className="text-lg font-bold text-slate-900">128.5M</p>
                  <p className="text-xs text-slate-500">Chi tiêu</p>
                </div>
              </div> */}
            </Card>

            {/* Navigation */}
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-0.5">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                          isActive
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.count && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"
                          }`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <Separator className="my-1" />
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="min-w-0">
            {/* ===== PROFILE TAB ===== */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-semibold">Thông tin cá nhân</CardTitle>
                        <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                      </div>
                      <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="fullname">Họ và tên</Label>
                        <Input id="fullname" defaultValue={user.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Input id="email" defaultValue={user.email} className="pr-20" />
                          <Badge variant="outline" className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px]">
                            Đã xác thực
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input id="phone" defaultValue={user.phone} />
                      </div>
                      <div className="space-y-2">
                        <Label>Ngày tham gia</Label>
                        <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/50 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />
                          {user.joinDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-md shadow-cyan-500/25 cursor-pointer">
                        Lưu thay đổi
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Bảo mật</CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100">
                          <Shield className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Mật khẩu</p>
                          <p className="text-xs text-slate-500">Cập nhật lần cuối: 2 tháng trước</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="cursor-pointer">Đổi mật khẩu</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ===== ORDERS TAB ===== */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold">Đơn hàng của tôi</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="all">
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="cursor-pointer">Tất cả</TabsTrigger>
                    <TabsTrigger value="shipping" className="cursor-pointer">Đang giao</TabsTrigger>
                    <TabsTrigger value="delivered" className="cursor-pointer">Đã giao</TabsTrigger>
                    <TabsTrigger value="completed" className="cursor-pointer">Hoàn thành</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4 mt-4">
                    {orders.map((order) => {
                      const config = statusConfig[order.status] || statusConfig.pending;
                      const StatusIcon = config.icon;
                      return (
                        <Card key={order.id} className="hover:shadow-md transition-shadow group">
                          <CardContent className="p-5">
                            {/* Order Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-mono text-slate-600">{order.id}</span>
                              </div>
                              <Badge variant="outline" className={`${config.bg} ${config.color} border font-medium`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {order.statusText}
                              </Badge>
                            </div>

                            {/* Order Body */}
                            <div className="flex items-center gap-4">
                              <img
                                src={order.image}
                                alt="Product"
                                className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-100"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-500">{order.items} sản phẩm • {order.date}</p>
                                <p className="text-lg font-bold text-slate-900 mt-0.5">{formatPrice(order.total)}</p>
                                {order.status === "shipping" && (
                                  <div className="mt-2">
                                    <Progress value={order.progress} className="h-1.5" />
                                    <p className="text-[11px] text-slate-400 mt-1">Dự kiến giao: 03/04/2026</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                                  <Link to="/track-order">Theo dõi</Link>
                                </Button>
                                <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white cursor-pointer">
                                  Mua lại
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </TabsContent>
                  <TabsContent value="shipping"><p className="text-center text-slate-400 py-12">Lọc đơn đang giao...</p></TabsContent>
                  <TabsContent value="delivered"><p className="text-center text-slate-400 py-12">Lọc đơn đã giao...</p></TabsContent>
                  <TabsContent value="completed"><p className="text-center text-slate-400 py-12">Lọc đơn hoàn thành...</p></TabsContent>
                </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ===== WISHLIST TAB ===== */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="px-6">
                    <CardTitle className="text-xl font-semibold">Sản phẩm yêu thích</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pt-0 pb-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-all">
                      <div className="relative">
                        <img src={item.image} alt={item.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 shadow-md">
                          -{item.discount}%
                        </Badge>
                        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-md transition-all cursor-pointer">
                          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        </button>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm leading-snug">{item.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(item.rating) ? "fill-current" : "text-slate-200"}`} />
                          ))}
                          <span className="text-slate-400 ml-1">{item.rating}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-red-500">{formatPrice(item.price)}</span>
                          <span className="text-sm text-slate-400 line-through">{formatPrice(item.originalPrice)}</span>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cursor-pointer">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Thêm vào giỏ
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ===== ADDRESSES TAB ===== */}
            {activeTab === "addresses" && (
              <div>
                <Card className="py-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-semibold">Địa chỉ của tôi</CardTitle>
                        <CardDescription>{addresses.length} địa chỉ</CardDescription>
                      </div>
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm địa chỉ
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                      {addresses.map((addr) => (
                  <Card key={addr.id} className={`transition-all ${addr.isDefault ? "ring-2 ring-cyan-500/30 shadow-md" : "hover:shadow-md"}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className={`p-3 rounded-xl ${addr.isDefault ? "bg-gradient-to-br from-cyan-50 to-blue-50" : "bg-slate-50"}`}>
                            <MapPin className={`w-5 h-5 ${addr.isDefault ? "text-cyan-600" : "text-slate-400"}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">{addr.label}</h3>
                              {addr.isDefault && (
                                <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px]">Mặc định</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{addr.name} • {addr.phone}</p>
                            <p className="text-sm text-slate-500 mt-1">{addr.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-cyan-600 cursor-pointer">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {!addr.isDefault && (
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500 cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ===== PAYMENT TAB ===== */}
            {activeTab === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Phương thức thanh toán</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="py-16 flex flex-col items-center text-center">
                  <div className="p-4 rounded-2xl bg-slate-50 mb-4">
                    <CreditCard className="w-12 h-12 text-slate-300" />
                  </div>
                  <p className="text-slate-500 mb-1">Bạn chưa có phương thức thanh toán nào</p>
                  <p className="text-sm text-slate-400 mb-6">Thêm thẻ để thanh toán nhanh hơn</p>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm thẻ mới
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ===== SETTINGS TAB ===== */}
            {activeTab === "settings" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Cài đặt</CardTitle>
                    <CardDescription>Quản lý thông báo và tùy chọn</CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Thông báo</CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4 space-y-1">
                    {[
                      { icon: Mail, title: "Nhận email thông báo", desc: "Thông báo về đơn hàng và khuyến mãi", defaultOn: true },
                      { icon: Phone, title: "Nhận thông báo SMS", desc: "Tin nhắn về trạng thái đơn hàng", defaultOn: true },
                      { icon: Bell, title: "Thông báo đẩy", desc: "Nhận push notification trên trình duyệt", defaultOn: false },
                    ].map((setting, i) => (
                      <div key={i} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-100">
                            <setting.icon className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{setting.title}</p>
                            <p className="text-xs text-slate-500">{setting.desc}</p>
                          </div>
                        </div>
                        <Switch defaultChecked={setting.defaultOn} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-red-100">
                  <CardHeader>
                    <CardTitle className="text-base text-red-600">Vùng nguy hiểm</CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Xóa tài khoản</p>
                        <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 cursor-pointer">
                        Xóa tài khoản
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
