import { Link } from "react-router";
import { Smartphone, Laptop, Headphones, Watch, Home as HomeIcon, ShoppingBag } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { useEffect, useState } from "react";

export function Home() {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 34, seconds: 56 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const flashSaleProducts = [
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
      name: "Samsung Galaxy S24 Ultra 512GB - Titan Black",
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
      name: "AirPods Pro 2 (USB-C) - Chính hãng Apple",
      image: "https://images.unsplash.com/photo-1590658058105-af4b65f8871b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 5490000,
      originalPrice: 6990000,
      discount: 21,
      sold: 678,
    },
  ];

  const popularProducts = [
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
      name: "Sony WH-1000XM5 - Tai nghe chống ồn cao cấp",
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
    {
      id: "13",
      name: "ASUS ROG Zephyrus G14 - Gaming Laptop",
      image: "https://images.unsplash.com/photo-1606625000171-fa7d471da28c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      price: 42990000,
      originalPrice: 52990000,
      discount: 19,
      sold: 64,
    },
  ];

  const categories = [
    { id: "smartphones", name: "Điện thoại", icon: Smartphone, slug: "dien-thoai" },
    { id: "laptops", name: "Laptop", icon: Laptop, slug: "laptop" },
    { id: "headphones", name: "Tai nghe", icon: Headphones, slug: "tai-nghe" },
    { id: "watches", name: "Đồng hồ", icon: Watch, slug: "dong-ho" },
    { id: "home", name: "Gia dụng", icon: HomeIcon, slug: "gia-dung" },
    { id: "accessories", name: "Phụ kiện", icon: ShoppingBag, slug: "phu-kien" },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0ACDFF] to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                Flash Deals mỗi ngày – Mua nhanh, giá sốc
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Giảm đến 70% cho hàng ngàn sản phẩm hot
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/flash-sale"
                  className="bg-[#0ACDFF] hover:bg-[#09b8e8] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
                >
                  Mua ngay
                </Link>
                <Link
                  to="/category/deals"
                  className="border-2 border-[#0ACDFF] text-[#0ACDFF] hover:bg-[#0ACDFF] hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200"
                >
                  Xem deal hot
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1673718424704-51d0d2ca1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                alt="Hero Product"
                className="w-full max-w-md mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">⚡ Flash Sale</h2>
              <p className="text-gray-600">Giá sốc có một không hai</p>
            </div>
            <div className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-lg">
              <span className="font-semibold">Kết thúc trong:</span>
              <div className="flex space-x-1">
                <div className="bg-white text-red-500 px-2 py-1 rounded font-bold">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <span>:</span>
                <div className="bg-white text-red-500 px-2 py-1 rounded font-bold">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <span>:</span>
                <div className="bg-white text-red-500 px-2 py-1 rounded font-bold">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {flashSaleProducts.map((product) => (
              <ProductCard key={product.id} {...product} variant="flashsale" />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/flash-sale"
              className="inline-block bg-[#0ACDFF] hover:bg-[#09b8e8] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Xem tất cả Flash Sale
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Danh mục nổi bật</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Icon className="w-12 h-12 mx-auto mb-3 text-[#0ACDFF]" />
                  <p className="font-semibold text-gray-800">{category.name}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sản phẩm phổ biến</h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-[#0ACDFF] text-white rounded-lg font-semibold">
                Giá tốt
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Bán chạy
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Mới nhất
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">🚚 Free ship toàn quốc</h3>
              <p>Đơn hàng từ 300.000đ</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">💰 Hoàn tiền 7 ngày</h3>
              <p>Nếu sản phẩm lỗi, không đúng mô tả</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
