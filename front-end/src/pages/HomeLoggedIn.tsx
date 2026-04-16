import { Link } from "react-router";
import { useEffect, useState } from "react";
import imgShopping from "~/imports/pic1.png";

export function HomeLoggedIn() {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });

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
      name: "iPhone 15 Pro Max 256GB",
      image: "https://images.unsplash.com/photo-1673718424704-51d0d2ca1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 25990000,
      originalPrice: 34990000,
      discount: 26,
    },
    {
      id: "2",
      name: "Samsung Galaxy S24 Ultra",
      image: "https://images.unsplash.com/photo-1673718424091-5fb734062c05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 29990000,
      originalPrice: 35990000,
      discount: 17,
    },
    {
      id: "3",
      name: "Xiaomi 14 Pro 5G",
      image: "https://images.unsplash.com/photo-1760443728256-617127d04066?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 18990000,
      originalPrice: 24990000,
      discount: 24,
    },
    {
      id: "4",
      name: "MacBook Pro M3 14 inch",
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 39990000,
      originalPrice: 49990000,
      discount: 20,
    }
  ];

  const categories = [
    { id: 1, name: "Điện tử", icon: "📱" },
    { id: 2, name: "Máy tính", icon: "💻" },
    { id: 3, name: "Âm thanh", icon: "🎧" },
    { id: 4, name: "Đồng hồ", icon: "⌚" },
  ];

  const recommendedProducts = [
    {
      id: "6",
      name: "Dell XPS 13 Plus - Core i7",
      image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 35990000,
      discount: 16,
    },
    {
      id: "7",
      name: "Sony WH-1000XM5",
      image: "https://images.unsplash.com/photo-1598900863662-da1c3e6dd9d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 7990000,
      discount: 20,
    },
    {
      id: "8",
      name: "Apple Watch Series 9",
      image: "https://images.unsplash.com/photo-1758348844355-2ef28345979d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 10990000,
      discount: 15,
    },
    {
      id: "9",
      name: "iPad Air M2 11 inch",
      image: "https://images.unsplash.com/photo-1635870723802-e88d76ae324e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 15990000,
      discount: 11,
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0acdff] to-white py-32 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute bg-[rgba(0,203,253,0.1)] blur-[32px] right-[-192px] rounded-full w-[384px] h-[384px] top-[-192px]" />
        <div className="absolute bg-[rgba(125,211,252,0.2)] blur-[20px] bottom-[-128px] left-[-128px] rounded-full w-[256px] h-[256px]" />

        <div className="max-w-[1280px] mx-auto px-8 relative">
          <div className="grid grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-7xl font-normal text-[#002733] leading-[72px] tracking-[-3.6px]">
                Flash Deals mỗi ngày – Mua nhanh, giá sốc
              </h1>
              <p className="text-xl text-[#00485b] opacity-90 leading-7">
                Giảm đến 70% cho hàng ngàn sản phẩm hot. Cơ hội săn sale duy nhất trong ngày.
              </p>
              <div className="flex gap-4 pt-4">
                <Link
                  to="/flash-sale"
                  className="bg-gradient-to-r from-[#00647e] to-[#00cbfd] text-[#e3f6ff] px-10 py-4 rounded-full shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:shadow-xl transition-all duration-300"
                >
                  Mua ngay
                </Link>
                <Link
                  to="/category/deals"
                  className="backdrop-blur-sm bg-white/20 text-[#00647e] border-2 border-[#00647e] px-11 py-4 rounded-full hover:bg-white/30 transition-all duration-300"
                >
                  Xem deal hot
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="absolute bg-[rgba(0,203,253,0.2)] blur-[32px] inset-0 rounded-3xl" />
              <div className="relative rounded-3xl shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden h-[500px]">
                <img src={imgShopping} alt="Shopping" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-[#b31b25] text-[#ffefee] px-3 py-1 rounded-full text-xs tracking-[1.2px] uppercase">
                Live Now
              </div>
              <h2 className="text-[30px] text-[#2b2f32] tracking-[-0.75px] uppercase">Flash Sale</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[rgba(179,27,37,0.1)] px-3 py-1 rounded-[12.8px]">
                <span className="text-2xl text-[#b31b25] font-mono">{String(timeLeft.hours).padStart(2, "0")}</span>
              </div>
              <span className="text-2xl text-[#9f0519] font-mono">:</span>
              <div className="bg-[rgba(179,27,37,0.1)] px-3 py-1 rounded-[12.8px]">
                <span className="text-2xl text-[#b31b25] font-mono">{String(timeLeft.minutes).padStart(2, "0")}</span>
              </div>
              <span className="text-2xl text-[#9f0519] font-mono">:</span>
              <div className="bg-[rgba(179,27,37,0.1)] px-3 py-1 rounded-[12.8px]">
                <span className="text-2xl text-[#b31b25] font-mono">{String(timeLeft.seconds).padStart(2, "0")}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {flashSaleProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
              >
                <div className="relative aspect-square">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-[#b31b25] text-white px-2 py-1 rounded-lg text-sm font-bold">
                    -{product.discount}%
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 min-h-[40px]">{product.name}</h3>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-[#b31b25]">{formatPrice(product.price)}</div>
                    {product.originalPrice && (
                      <div className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</div>
                    )}
                  </div>
                  <button className="w-full bg-gradient-to-r from-[#00647e] to-[#00cbfd] text-white py-2 rounded-lg mt-3 hover:shadow-md transition-all">
                    Mua ngay
                  </button>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/flash-sale"
              className="inline-block bg-gradient-to-r from-[#00647e] to-[#00cbfd] text-white px-8 py-3 rounded-full hover:shadow-lg transition-all"
            >
              Xem tất cả Flash Sale
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">Danh mục nổi bật</h2>
          <div className="grid grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="text-5xl mb-3">{cat.icon}</div>
                <p className="text-white font-semibold text-lg">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Free Shipping Banner */}
      <section className="py-12 bg-gradient-to-r from-[#00647e] to-[#00cbfd]">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="grid grid-cols-2 gap-8 text-white">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🚚</div>
              <div>
                <h3 className="text-2xl font-semibold mb-1">Free ship toàn quốc</h3>
                <p className="text-cyan-100">Đơn hàng từ 300.000đ</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔒</div>
              <div>
                <h3 className="text-2xl font-semibold mb-1">An toàn giao dịch</h3>
                <p className="text-cyan-100">Bảo mật thông tin khách hàng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">Gợi ý dành cho bạn</h2>
          <div className="grid grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
              >
                <div className="relative aspect-square">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                    -{product.discount}%
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 min-h-[40px]">{product.name}</h3>
                  <div className="text-lg font-bold text-red-500">{formatPrice(product.price)}</div>
                  <button className="w-full bg-[#0ACDFF] hover:bg-[#09b8e8] text-white py-2 rounded-lg mt-3 transition-colors">
                    Thêm vào giỏ
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
