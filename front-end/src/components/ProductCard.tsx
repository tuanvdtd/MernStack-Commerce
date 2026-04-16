import { Link } from "react-router";

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  sold?: number;
  variant?: "default" | "flashsale";
}

export function ProductCard({ id, image, name, price, originalPrice, discount, sold, variant = "default" }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const isFlashSale = variant === "flashsale";

  return (
    <Link to={`/product/${id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.03] h-full flex flex-col">
        {/* Image */}
        <div className={`relative aspect-square overflow-hidden ${isFlashSale ? "p-3" : ""}`}>
          <img
            src={image}
            alt={name}
            className={`w-full h-full object-cover ${isFlashSale ? "rounded-xl" : ""}`}
          />
          {discount && (
            <div className={`absolute ${isFlashSale ? "top-5 right-5" : "top-2 right-2"} bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold`}>
              -{discount}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 min-h-[40px]">{name}</h3>

          <div className="space-y-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-semibold text-red-500">{formatPrice(price)}</span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(originalPrice)}</span>
              )}
            </div>

            {sold && (
              <p className="text-xs text-gray-500">Đã bán {sold}</p>
            )}

            <button className="w-full bg-[#0ACDFF] hover:bg-[#09b8e8] text-white py-2 rounded-lg transition-colors duration-200 mt-2">
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
