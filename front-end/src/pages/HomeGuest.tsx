import { Link } from "react-router";
import { Star } from "lucide-react";
import { useState } from "react";
import svgPaths from "~/imports/svg-guest";

export function HomeGuest() {
  const [selectedCategory, setSelectedCategory] = useState("dien-thoai");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");

  const products = [
    {
      id: "1",
      name: "iPhone 14 Pro Max 128GB VN/A- Hàng chính hãng",
      image: "https://images.unsplash.com/photo-1673718424704-51d0d2ca1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 25990000,
      originalPrice: 34990000,
      discount: 26,
      rating: 4.8,
      reviews: 128,
    },
    {
      id: "2",
      name: "Samsung Galaxy S24 Ultra 512GB - Titan Gray",
      image: "https://images.unsplash.com/photo-1673718424091-5fb734062c05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 29990000,
      originalPrice: 35990000,
      discount: 17,
      rating: 4.7,
      reviews: 96,
    },
    {
      id: "3",
      name: "Xiaomi Redmi Note 13 Pro 8GB/256GB",
      image: "https://images.unsplash.com/photo-1760443728256-617127d04066?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 7990000,
      originalPrice: 9990000,
      discount: 20,
      rating: 4.5,
      reviews: 234,
    },
    {
      id: "4",
      name: "OPPO Reno 11 F 5G 8GB/256GB",
      image: "https://images.unsplash.com/photo-1673718423886-ba603e698efd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 8490000,
      originalPrice: 10990000,
      discount: 23,
      rating: 4.6,
      reviews: 187,
    },
    {
      id: "5",
      name: "Google Pixel 8 Pro 5G 12GB/256GB",
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 19990000,
      originalPrice: 24990000,
      discount: 20,
      rating: 4.8,
      reviews: 145,
    },
    {
      id: "6",
      name: "Realme 11 Pro Plus 5G 12GB/512GB",
      image: "https://images.unsplash.com/photo-1678652560298-66ea5ea2b597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 9990000,
      originalPrice: 12990000,
      discount: 23,
      rating: 4.4,
      reviews: 298,
    },
    {
      id: "7",
      name: "Vivo V30 Pro 5G 12GB/512GB - Hàng chính hãng",
      image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 11990000,
      originalPrice: 14990000,
      discount: 20,
      rating: 4.6,
      reviews: 178,
    },
    {
      id: "8",
      name: "OnePlus 12R 5G 16GB/256GB - Gray",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 14990000,
      originalPrice: 18990000,
      discount: 21,
      rating: 4.7,
      reviews: 203,
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 py-4">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-white text-center">
            🎉 Chào mừng khách hàng mới! Đăng ký ngay để nhận ưu đãi đặc biệt
            <Link to="/account" className="ml-2 underline font-semibold hover:text-cyan-100">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="col-span-1">
            {/* Categories Filter */}
            <div className="bg-[#f8fafc] rounded-xl p-6 mb-4">
              <div className="mb-6">
                <h3 className="text-lg text-[#0f172a] mb-1">Categories</h3>
                <p className="text-xs text-[#64748b]">Browse by department</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory("dien-thoai")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === "dien-thoai"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : "text-[#64748b] hover:bg-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 15 12">
                    <path d={svgPaths.p168bfe00} />
                  </svg>
                  <span className="text-sm">Điện thoại</span>
                </button>

                <button
                  onClick={() => setSelectedCategory("laptop")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === "laptop"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : "text-[#64748b] hover:bg-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 18 12.75">
                    <path d={svgPaths.p22161040} />
                  </svg>
                  <span className="text-sm">Laptop</span>
                </button>

                <button
                  onClick={() => setSelectedCategory("phu-kien")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === "phu-kien"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : "text-[#64748b] hover:bg-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 13.5 13.5">
                    <path d={svgPaths.p3ac45c20} />
                  </svg>
                  <span className="text-sm">Phụ kiện</span>
                </button>

                <button
                  onClick={() => setSelectedCategory("gia-dung")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === "gia-dung"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : "text-[#64748b] hover:bg-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 13.5 13.5">
                    <path d={svgPaths.p24f9d100} />
                  </svg>
                  <span className="text-sm">Gia dụng</span>
                </button>
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="text-sm text-[#94a3b8] tracking-wider uppercase mb-4">Khoảng giá</h4>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                    placeholder="Từ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={priceTo}
                    onChange={(e) => setPriceTo(e.target.value)}
                    placeholder="Đến"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg hover:shadow-md transition-all">
                  Áp dụng
                </button>
              </div>

              {/* Quick Price Filters */}
              <div className="mt-6 space-y-2">
                <h4 className="text-sm text-[#94a3b8] tracking-wider uppercase mb-3">Giá phổ biến</h4>
                {["Dưới 5 triệu", "5 - 10 triệu", "10 - 20 triệu", "Trên 20 triệu"].map((range) => (
                  <label key={range} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
                    />
                    <span className="text-sm text-gray-700">{range}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="col-span-3">
            {/* Sort Bar */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Sắp xếp:</span>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-semibold">
                    Giá tốt
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    Bán chạy
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    Mới nhất
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Products */}
            <div className="grid grid-cols-3 gap-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    {product.discount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 min-h-[40px]">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                      <span className="text-xs text-gray-400 ml-1">({product.reviews})</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-red-500">{formatPrice(product.price)}</div>
                      {product.originalPrice && (
                        <div className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</div>
                      )}
                    </div>
                    <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg mt-3 hover:shadow-md transition-all">
                      Xem chi tiết
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-8">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                ‹
              </button>
              <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
