import { User, Package, Heart, Settings, MapPin, CreditCard, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export function Account() {
  const [activeTab, setActiveTab] = useState("profile");

  const user = {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0901234567",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
    joinDate: "2024-01-15",
  };

  const orders = [
    {
      id: "FLB2026040412345",
      date: "2026-04-01",
      status: "shipping",
      statusText: "Đang giao hàng",
      total: 44970000,
      items: 3,
      image: "https://images.unsplash.com/photo-1673718424704-51d0d2ca1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    },
    {
      id: "FLB2026032398765",
      date: "2026-03-23",
      status: "delivered",
      statusText: "Đã giao hàng",
      total: 15990000,
      items: 1,
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
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
    },
    {
      id: "14",
      name: "Samsung Galaxy Buds2 Pro",
      image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 4490000,
      originalPrice: 5490000,
      discount: 18,
    },
  ];

  const addresses = [
    {
      id: 1,
      label: "Nhà riêng",
      name: "Nguyễn Văn A",
      phone: "0901234567",
      address: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
      isDefault: true,
    },
    {
      id: 2,
      label: "Văn phòng",
      name: "Nguyễn Văn A",
      phone: "0901234567",
      address: "456 Lê Văn Việt, Quận 9, TP. Hồ Chí Minh",
      isDefault: false,
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const tabs = [
    { id: "profile", label: "Thông tin cá nhân", icon: User },
    { id: "orders", label: "Đơn hàng", icon: Package },
    { id: "wishlist", label: "Yêu thích", icon: Heart },
    { id: "addresses", label: "Địa chỉ", icon: MapPin },
    { id: "payment", label: "Thanh toán", icon: CreditCard },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              {/* User Info */}
              <div className="text-center mb-6 pb-6 border-b">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                />
                <h2 className="font-bold text-gray-900 text-lg">{user.name}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-[#0ACDFF] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{tab.label}</span>
                    </button>
                  );
                })}
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span className="font-semibold">Đăng xuất</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-8">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Họ và tên</label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0ACDFF] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0ACDFF] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        defaultValue={user.phone}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0ACDFF] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Ngày tham gia</label>
                      <input
                        type="text"
                        value={user.joinDate}
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                      />
                    </div>
                    <button className="bg-[#0ACDFF] hover:bg-[#09b8e8] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Đơn hàng của tôi</h2>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#0ACDFF] transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Mã đơn hàng: {order.id}</p>
                            <p className="text-sm text-gray-600">Ngày đặt: {order.date}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                              order.status === "shipping"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {order.statusText}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mb-4">
                          <img src={order.image} alt="Product" className="w-20 h-20 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="text-gray-700">{order.items} sản phẩm</p>
                            <p className="text-xl font-bold text-red-500">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Link
                            to="/track-order"
                            className="flex-1 border-2 border-[#0ACDFF] text-[#0ACDFF] hover:bg-[#0ACDFF] hover:text-white py-2 rounded-lg font-semibold transition-all text-center"
                          >
                            Theo dõi
                          </Link>
                          <button className="flex-1 bg-[#0ACDFF] hover:bg-[#09b8e8] text-white py-2 rounded-lg font-semibold transition-colors">
                            Mua lại
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm yêu thích</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {wishlist.map((item) => (
                      <div key={item.id} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#0ACDFF] transition-colors">
                        <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                          <div className="flex items-baseline space-x-2 mb-3">
                            <span className="text-xl font-bold text-red-500">{formatPrice(item.price)}</span>
                            <span className="text-sm text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                              -{item.discount}%
                            </span>
                          </div>
                          <button className="w-full bg-[#0ACDFF] hover:bg-[#09b8e8] text-white py-2 rounded-lg font-semibold transition-colors">
                            Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Địa chỉ của tôi</h2>
                    <button className="bg-[#0ACDFF] hover:bg-[#09b8e8] text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      Thêm địa chỉ mới
                    </button>
                  </div>
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`border-2 rounded-xl p-6 ${
                          addr.isDefault ? "border-[#0ACDFF] bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-bold text-gray-900">{addr.label}</h3>
                              {addr.isDefault && (
                                <span className="bg-[#0ACDFF] text-white px-2 py-1 rounded text-xs font-semibold">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 mb-1">{addr.name} | {addr.phone}</p>
                            <p className="text-gray-600">{addr.address}</p>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button className="text-[#0ACDFF] hover:text-[#09b8e8] font-semibold">
                            Chỉnh sửa
                          </button>
                          {!addr.isDefault && (
                            <>
                              <span className="text-gray-300">|</span>
                              <button className="text-gray-600 hover:text-gray-800 font-semibold">
                                Xóa
                              </button>
                              <span className="text-gray-300">|</span>
                              <button className="text-[#0ACDFF] hover:text-[#09b8e8] font-semibold">
                                Đặt làm mặc định
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Tab */}
              {activeTab === "payment" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>
                  <div className="text-center py-12">
                    <CreditCard className="w-24 h-24 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-4">Bạn chưa có phương thức thanh toán nào</p>
                    <button className="bg-[#0ACDFF] hover:bg-[#09b8e8] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                      Thêm thẻ
                    </button>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b">
                      <div>
                        <h3 className="font-semibold text-gray-900">Nhận email thông báo</h3>
                        <p className="text-sm text-gray-600">Nhận thông báo về đơn hàng và khuyến mãi</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0ACDFF]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ACDFF]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b">
                      <div>
                        <h3 className="font-semibold text-gray-900">Nhận thông báo SMS</h3>
                        <p className="text-sm text-gray-600">Nhận tin nhắn về trạng thái đơn hàng</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0ACDFF]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ACDFF]"></div>
                      </label>
                    </div>
                    <div className="pt-4">
                      <button className="text-red-500 hover:text-red-600 font-semibold">
                        Đổi mật khẩu
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
