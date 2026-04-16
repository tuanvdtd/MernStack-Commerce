import { useParams, Link } from "react-router";
import { Star, Truck, ShieldCheck, ArrowLeft, Plus, Minus } from "lucide-react";
import { useState } from "react";

export function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState<"description" | "specifications" | "reviews">("description");
  const [selectedColor, setSelectedColor] = useState("Titan Đen");
  const [selectedStorage, setSelectedStorage] = useState("256GB");

  const colors = [
    { name: "Titan Đen", hex: "#1a1a1a", stock: 156, imageIndex: 0 },
    { name: "Titan Trắng", hex: "#f5f5f5", stock: 89, imageIndex: 1 },
    { name: "Titan Tự Nhiên", hex: "#dcc5a8", stock: 124, imageIndex: 2 },
    { name: "Titan Xanh", hex: "#4a7c9e", stock: 67, imageIndex: 3 },
  ];

  const storageOptions = [
    { size: "128GB", priceAdjustment: -2000000 },
    { size: "256GB", priceAdjustment: 0 },
    { size: "512GB", priceAdjustment: 4000000 },
    { size: "1TB", priceAdjustment: 8000000 },
  ];

  const reviews = [
    {
      id: 1,
      userName: "Nguyễn Văn A",
      verified: true,
      rating: 5,
      date: "2026-03-15",
      content: "Sản phẩm rất tuyệt vời, đóng gói cẩn thận, giao hàng nhanh. Máy chính hãng, đầy đủ phụ kiện. Màn hình đẹp, hiệu năng mạnh mẽ. Rất hài lòng với sản phẩm này!",
      helpful: 124,
      images: [
        "https://images.unsplash.com/photo-1673718424704-51d0d2ca1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
        "https://images.unsplash.com/photo-1673718424091-5fb734062c05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      ],
    },
    {
      id: 2,
      userName: "Trần Thị B",
      verified: true,
      rating: 5,
      date: "2026-03-10",
      content: "Máy đẹp, hoạt động mượt mà. Camera chụp ảnh cực kỳ sắc nét. Pin trâu, dùng cả ngày vẫn còn. Shop giao hàng nhanh, đóng gói kỹ càng. Rất đáng mua!",
      helpful: 89,
      images: [],
    },
    {
      id: 3,
      userName: "Lê Văn C",
      verified: false,
      rating: 4,
      date: "2026-03-05",
      content: "Sản phẩm tốt, chất lượng ổn. Chỉ có giá hơi cao một chút. Nhưng nhìn chung vẫn đáng tiền. Giao hàng đúng hẹn.",
      helpful: 45,
      images: [
        "https://images.unsplash.com/photo-1673718423886-ba603e698efd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      ],
    },
    {
      id: 4,
      userName: "Phạm Thị D",
      verified: true,
      rating: 5,
      date: "2026-02-28",
      content: "Lần đầu mua iPhone và rất hài lòng. Máy đẹp, sang trọng. Màn hình hiển thị rất sắc nét. Cảm ơn shop đã tư vấn nhiệt tình!",
      helpful: 67,
      images: [],
    },
  ];

  const currentColor = colors.find(c => c.name === selectedColor);
  const currentStorage = storageOptions.find(s => s.size === selectedStorage);
  const basePrice = 25990000;
  const adjustedPrice = basePrice + (currentStorage?.priceAdjustment || 0);
  const originalPrice = 34990000 + (currentStorage?.priceAdjustment || 0);
  const discount = Math.round(((originalPrice - adjustedPrice) / originalPrice) * 100);

  const product = {
    id,
    name: `iPhone 15 Pro Max ${selectedStorage} - ${selectedColor}`,
    images: [
      "https://images.unsplash.com/photo-1673718424704-51d0d2ca1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1673718424091-5fb734062c05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1673718423886-ba603e698efd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1673718423582-f3378102c0d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    ],
    price: adjustedPrice,
    originalPrice: originalPrice,
    discount: discount,
    rating: 4.8,
    reviews: 1234,
    sold: 234,
    stock: currentColor?.stock || 156,
    description: `
      <h3>Thông tin sản phẩm</h3>
      <p>iPhone 15 Pro Max là dòng sản phẩm cao cấp nhất của Apple với nhiều tính năng vượt trội:</p>
      <ul>
        <li>Chip A17 Pro mạnh mẽ nhất từ trước đến nay</li>
        <li>Màn hình Super Retina XDR 6.7 inch</li>
        <li>Camera chính 48MP với zoom quang học 5x</li>
        <li>Khung titan cấp hàng không vũ trụ</li>
        <li>Pin sử dụng cả ngày dài</li>
        <li>Hỗ trợ 5G</li>
      </ul>
    `,
    specifications: [
      { label: "Màn hình", value: "6.7 inch, Super Retina XDR" },
      { label: "Chip", value: "A17 Pro" },
      { label: "Camera sau", value: "48MP + 12MP + 12MP" },
      { label: "Camera trước", value: "12MP" },
      { label: "RAM", value: "8GB" },
      { label: "Bộ nhớ", value: "256GB" },
      { label: "Pin", value: "4422 mAh" },
      { label: "Hệ điều hành", value: "iOS 17" },
    ],
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const handleAddToCart = () => {
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    alert("Chuyển đến trang thanh toán...");
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-[#0ACDFF] hover:text-[#09b8e8]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? "border-[#0ACDFF]" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold">{product.rating}</span>
                </div>
                <span className="text-gray-500">|</span>
                <span className="text-gray-600">{product.reviews} đánh giá</span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-600">Đã bán {product.sold}</span>
              </div>

              {/* Price */}
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <div className="flex items-baseline space-x-3 mb-2">
                  <span className="text-4xl font-bold text-red-500">{formatPrice(product.price)}</span>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold">
                    -{product.discount}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">Tiết kiệm {formatPrice(product.originalPrice - product.price)}</p>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Màu sắc: {selectedColor}</label>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color.name);
                        setSelectedImage(color.imageIndex);
                      }}
                      className={`relative w-14 h-14 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColor === color.name ? "border-[#0ACDFF] ring-2 ring-[#0ACDFF] ring-offset-2" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor === color.name && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#0ACDFF]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Dung lượng</label>
                <div className="grid grid-cols-4 gap-3">
                  {storageOptions.map((option) => (
                    <button
                      key={option.size}
                      onClick={() => setSelectedStorage(option.size)}
                      className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all hover:scale-105 ${
                        selectedStorage === option.size
                          ? "border-[#0ACDFF] bg-[#e6f7ff] text-[#0ACDFF]"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {option.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Số lượng</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-16 text-center py-3 border-x-2 border-gray-300 font-semibold text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-gray-600">{product.stock} sản phẩm có sẵn</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 border-2 border-[#0ACDFF] text-[#0ACDFF] hover:bg-[#0ACDFF] hover:text-white py-4 rounded-xl font-semibold transition-all duration-200"
                >
                  Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-[#0ACDFF] hover:bg-[#09b8e8] text-white py-4 rounded-xl font-semibold transition-all duration-200"
                >
                  Mua ngay
                </button>
              </div>

              {/* Benefits */}
              <div className="space-y-3 border-t pt-6">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Truck className="w-5 h-5 text-[#0ACDFF]" />
                  <span>Miễn phí vận chuyển toàn quốc</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <ShieldCheck className="w-5 h-5 text-[#0ACDFF]" />
                  <span>Bảo hành chính hãng 12 tháng</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <ShieldCheck className="w-5 h-5 text-[#0ACDFF]" />
                  <span>Đổi trả trong 7 ngày nếu có lỗi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-12">
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setSelectedTab("description")}
                  className={`pb-4 border-b-2 font-semibold transition-colors ${
                    selectedTab === "description"
                      ? "border-[#0ACDFF] text-[#0ACDFF]"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Mô tả sản phẩm
                </button>
                <button
                  onClick={() => setSelectedTab("specifications")}
                  className={`pb-4 border-b-2 font-semibold transition-colors ${
                    selectedTab === "specifications"
                      ? "border-[#0ACDFF] text-[#0ACDFF]"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Thông số kỹ thuật
                </button>
                <button
                  onClick={() => setSelectedTab("reviews")}
                  className={`pb-4 border-b-2 font-semibold transition-colors ${
                    selectedTab === "reviews"
                      ? "border-[#0ACDFF] text-[#0ACDFF]"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Đánh giá ({product.reviews})
                </button>
              </div>
            </div>

            {/* Description Tab */}
            {selectedTab === "description" && (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {/* Specifications Tab */}
            {selectedTab === "specifications" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Thông số kỹ thuật</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <table className="w-full">
                    <tbody>
                      {product.specifications.map((spec, idx) => (
                        <tr key={idx} className="border-b border-gray-200 last:border-0">
                          <td className="py-3 font-semibold text-gray-700 w-1/3">{spec.label}</td>
                          <td className="py-3 text-gray-600">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {selectedTab === "reviews" && (
              <div>
                {/* Reviews Summary */}
                <div className="bg-gradient-to-br from-[#f0f9ff] to-white rounded-xl p-8 mb-8 border border-[#0ACDFF]/20">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-[#0ACDFF] mb-2">{product.rating}</div>
                      <div className="flex items-center justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${
                              star <= Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600">{product.reviews} đánh giá</p>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-12">{rating} sao</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${rating === 5 ? 75 : rating === 4 ? 15 : rating === 3 ? 7 : rating === 2 ? 2 : 1}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">
                            {rating === 5 ? 75 : rating === 4 ? 15 : rating === 3 ? 7 : rating === 2 ? 2 : 1}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Filter Options */}
                <div className="flex items-center gap-4 mb-6">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0ACDFF]">
                    <option>Tất cả đánh giá</option>
                    <option>5 sao</option>
                    <option>4 sao</option>
                    <option>3 sao</option>
                    <option>2 sao</option>
                    <option>1 sao</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0ACDFF]">
                    <option>Mới nhất</option>
                    <option>Cũ nhất</option>
                    <option>Hữu ích nhất</option>
                  </select>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Có hình ảnh
                  </button>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      {/* Reviewer Info */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#0ACDFF] to-[#00647e] rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{review.userName}</span>
                              {review.verified && (
                                <span className="bg-[#00647e] text-white text-xs px-2 py-0.5 rounded-full">
                                  ✓ Đã mua hàng
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review Content */}
                      <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>

                      {/* Review Images */}
                      {review.images.length > 0 && (
                        <div className="flex gap-2 mb-4">
                          {review.images.map((img, idx) => (
                            <div key={idx} className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                              <img src={img} alt={`Review ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Helpful Actions */}
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-[#0ACDFF] transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          <span className="text-sm">Hữu ích ({review.helpful})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
