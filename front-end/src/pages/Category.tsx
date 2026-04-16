import { useParams } from "react-router";
import { ProductCard } from "../components/ProductCard";
import { Filter, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export function Category() {
  const { slug } = useParams();
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  const categoryNames: Record<string, string> = {
    "dien-thoai": "Điện thoại",
    laptop: "Laptop",
    "tai-nghe": "Tai nghe",
    "dong-ho": "Đồng hồ",
    "gia-dung": "Gia dụng",
    "phu-kien": "Phụ kiện",
    all: "Tất cả sản phẩm",
    deals: "Deal hot",
  };

  const products = [
    {
      id: "1",
      name: "iPhone 15 Pro Max 256GB - Chính hãng VN/A",
      image: "https://images.unsplash.com/photo-1673718424704-51d0d2ca1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 25990000,
      originalPrice: 34990000,
      discount: 26,
      sold: 234,
    },
    {
      id: "2",
      name: "Samsung Galaxy S24 Ultra 512GB",
      image: "https://images.unsplash.com/photo-1673718424091-5fb734062c05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 29990000,
      originalPrice: 35990000,
      discount: 17,
      sold: 156,
    },
    {
      id: "3",
      name: "Xiaomi 14 Pro 5G 12GB/512GB",
      image: "https://images.unsplash.com/photo-1760443728256-617127d04066?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 18990000,
      originalPrice: 24990000,
      discount: 24,
      sold: 432,
    },
    {
      id: "4",
      name: "MacBook Pro M3 14 inch 2024",
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 39990000,
      originalPrice: 49990000,
      discount: 20,
      sold: 89,
    },
    {
      id: "5",
      name: "AirPods Pro 2 (USB-C) - Chính hãng",
      image: "https://images.unsplash.com/photo-1590658058105-af4b65f8871b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 5490000,
      originalPrice: 6990000,
      discount: 21,
      sold: 678,
    },
    {
      id: "6",
      name: "Dell XPS 13 Plus - Core i7 Gen 13",
      image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 35990000,
      originalPrice: 42990000,
      discount: 16,
      sold: 123,
    },
    {
      id: "7",
      name: "Sony WH-1000XM5 - Tai nghe chống ồn",
      image: "https://images.unsplash.com/photo-1598900863662-da1c3e6dd9d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 7990000,
      originalPrice: 9990000,
      discount: 20,
      sold: 345,
    },
    {
      id: "8",
      name: "Apple Watch Series 9 GPS 45mm",
      image: "https://images.unsplash.com/photo-1758348844355-2ef28345979d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 10990000,
      originalPrice: 12990000,
      discount: 15,
      sold: 267,
    },
    {
      id: "9",
      name: "iPad Air M2 11 inch WiFi 128GB",
      image: "https://images.unsplash.com/photo-1635870723802-e88d76ae324e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 15990000,
      originalPrice: 17990000,
      discount: 11,
      sold: 198,
    },
    {
      id: "10",
      name: "Lenovo ThinkPad X1 Carbon Gen 11",
      image: "https://images.unsplash.com/photo-1684384891902-12fe45aa3596?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 32990000,
      originalPrice: 39990000,
      discount: 18,
      sold: 87,
    },
    {
      id: "11",
      name: "JBL Tune 230NC TWS - Tai nghe true wireless",
      image: "https://images.unsplash.com/photo-1632835746204-22f652dac3af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 1990000,
      originalPrice: 2990000,
      discount: 33,
      sold: 892,
    },
    {
      id: "12",
      name: "Samsung Galaxy Watch 6 Classic 47mm",
      image: "https://images.unsplash.com/photo-1758348844371-dfbae2780bd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 8990000,
      originalPrice: 10990000,
      discount: 18,
      sold: 156,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {categoryNames[slug || "all"] || "Danh mục"}
        </h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Bộ lọc
                </h2>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Khoảng giá</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value="all"
                      checked={priceRange === "all"}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="text-[#0ACDFF] focus:ring-[#0ACDFF]"
                    />
                    <span className="text-gray-700">Tất cả</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value="under-5m"
                      checked={priceRange === "under-5m"}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="text-[#0ACDFF] focus:ring-[#0ACDFF]"
                    />
                    <span className="text-gray-700">Dưới 5 triệu</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value="5m-10m"
                      checked={priceRange === "5m-10m"}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="text-[#0ACDFF] focus:ring-[#0ACDFF]"
                    />
                    <span className="text-gray-700">5 - 10 triệu</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value="10m-20m"
                      checked={priceRange === "10m-20m"}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="text-[#0ACDFF] focus:ring-[#0ACDFF]"
                    />
                    <span className="text-gray-700">10 - 20 triệu</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value="over-20m"
                      checked={priceRange === "over-20m"}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="text-[#0ACDFF] focus:ring-[#0ACDFF]"
                    />
                    <span className="text-gray-700">Trên 20 triệu</span>
                  </label>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Thương hiệu</h3>
                <div className="space-y-2">
                  {["Apple", "Samsung", "Xiaomi", "Dell", "Sony"].map((brand) => (
                    <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="text-[#0ACDFF] focus:ring-[#0ACDFF] rounded"
                      />
                      <span className="text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Đánh giá</h3>
                <div className="space-y-2">
                  {[5, 4, 3].map((rating) => (
                    <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="text-[#0ACDFF] focus:ring-[#0ACDFF] rounded"
                      />
                      <span className="text-gray-700 flex items-center">
                        {rating} ⭐ trở lên
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full mt-6 bg-[#0ACDFF] hover:bg-[#09b8e8] text-white py-3 rounded-lg font-semibold transition-colors">
                Áp dụng
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-700">
                <SlidersHorizontal className="w-5 h-5" />
                <span className="font-semibold">Sắp xếp:</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    sortBy === "popular"
                      ? "bg-[#0ACDFF] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Phổ biến
                </button>
                <button
                  onClick={() => setSortBy("latest")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    sortBy === "latest"
                      ? "bg-[#0ACDFF] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => setSortBy("best-selling")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    sortBy === "best-selling"
                      ? "bg-[#0ACDFF] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Bán chạy
                </button>
                <button
                  onClick={() => setSortBy("price-low")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    sortBy === "price-low"
                      ? "bg-[#0ACDFF] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Giá thấp
                </button>
                <button
                  onClick={() => setSortBy("price-high")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    sortBy === "price-high"
                      ? "bg-[#0ACDFF] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Giá cao
                </button>
              </div>
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8 space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Trước
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    page === 1
                      ? "bg-[#0ACDFF] text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
