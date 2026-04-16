import { ProductCard } from "~/components/ProductCard";
import { useEffect, useState } from "react";

export function FlashSale() {
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
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">⚡ Flash Sale Hot</h1>
          <p className="text-xl mb-6">Giảm giá sốc - Số lượng có hạn</p>

          {/* Countdown */}
          <div className="flex justify-center items-center space-x-4">
            <span className="text-lg font-semibold">Kết thúc trong:</span>
            <div className="flex space-x-2">
              <div className="bg-white text-red-500 px-4 py-3 rounded-xl font-bold text-2xl min-w-[60px]">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <span className="text-3xl">:</span>
              <div className="bg-white text-red-500 px-4 py-3 rounded-xl font-bold text-2xl min-w-[60px]">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <span className="text-3xl">:</span>
              <div className="bg-white text-red-500 px-4 py-3 rounded-xl font-bold text-2xl min-w-[60px]">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🔥 Đừng bỏ lỡ cơ hội vàng!
              </h2>
              <p className="text-gray-700">Giảm giá lên đến 70% cho các sản phẩm hot nhất</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-red-500">70%</p>
              <p className="text-gray-700">Giảm tối đa</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {flashSaleProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
}
