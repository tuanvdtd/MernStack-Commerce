import { Package, MapPin, CheckCircle, Truck, Clock } from "lucide-react";
import { useState } from "react";

export function TrackOrder() {
  const [orderCode, setOrderCode] = useState("");
  const [showOrder, setShowOrder] = useState(false);

  const handleTrack = () => {
    if (orderCode.trim()) {
      setShowOrder(true);
    }
  };

  const orderDetails = {
    code: "FLB2026040412345",
    status: "shipping",
    createdAt: "2026-04-01 10:30",
    totalAmount: 44970000,
    items: [
      {
        id: "1",
        name: "iPhone 15 Pro Max 256GB",
        image: "https://images.unsplash.com/photo-1673718424704-51d0d2ca1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
        quantity: 1,
        price: 25990000,
      },
      {
        id: "7",
        name: "Sony WH-1000XM5",
        image: "https://images.unsplash.com/photo-1598900863662-da1c3e6dd9d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
        quantity: 2,
        price: 7990000,
      },
    ],
    timeline: [
      {
        status: "ordered",
        title: "Đặt hàng thành công",
        description: "Đơn hàng đã được xác nhận",
        time: "2026-04-01 10:30",
        completed: true,
      },
      {
        status: "confirmed",
        title: "Đã xác nhận",
        description: "Người bán đã xác nhận đơn hàng",
        time: "2026-04-01 14:20",
        completed: true,
      },
      {
        status: "packed",
        title: "Đã đóng gói",
        description: "Đơn hàng đang được chuẩn bị giao",
        time: "2026-04-02 09:15",
        completed: true,
      },
      {
        status: "shipping",
        title: "Đang giao hàng",
        description: "Đơn hàng đang trên đường giao đến bạn",
        time: "2026-04-03 08:00",
        completed: true,
      },
      {
        status: "delivered",
        title: "Đã giao hàng",
        description: "Giao hàng thành công",
        time: "",
        completed: false,
      },
    ],
    shipping: {
      carrier: "Giao Hàng Nhanh",
      trackingNumber: "GHN123456789",
      estimatedDelivery: "2026-04-05",
      address: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
    },
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Theo dõi đơn hàng</h1>

        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="max-w-2xl mx-auto">
            <label className="block text-gray-700 font-semibold mb-3">
              Nhập mã đơn hàng của bạn
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="Ví dụ: FLB2026040412345"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0ACDFF] focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleTrack()}
              />
              <button
                onClick={handleTrack}
                className="bg-[#0ACDFF] hover:bg-[#09b8e8] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Tra cứu
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Mã đơn hàng có trong email xác nhận hoặc tin nhắn SMS
            </p>
          </div>
        </div>

        {/* Order Details */}
        {showOrder && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Đơn hàng #{orderDetails.code}</h2>
                  <p className="text-gray-600">Đặt hàng lúc {orderDetails.createdAt}</p>
                </div>
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Đang giao hàng
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                {orderDetails.timeline.map((step, index) => (
                  <div key={step.status} className="flex mb-8 last:mb-0">
                    <div className="flex flex-col items-center mr-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-500"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Clock className="w-6 h-6" />
                        )}
                      </div>
                      {index < orderDetails.timeline.length - 1 && (
                        <div
                          className={`w-1 h-16 ${
                            step.completed ? "bg-green-500" : "bg-gray-300"
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-gray-600 text-sm mb-1">{step.description}</p>
                      {step.time && (
                        <p className="text-gray-500 text-sm">{step.time}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[#0ACDFF]" />
                Thông tin vận chuyển
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Đơn vị vận chuyển</span>
                  <span className="font-semibold">{orderDetails.shipping.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã vận đơn</span>
                  <span className="font-semibold">{orderDetails.shipping.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dự kiến giao hàng</span>
                  <span className="font-semibold text-green-600">
                    {orderDetails.shipping.estimatedDelivery}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Địa chỉ giao hàng</span>
                  <span className="font-semibold text-right max-w-md">
                    {orderDetails.shipping.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-[#0ACDFF]" />
                Sản phẩm trong đơn hàng
              </h3>
              <div className="space-y-4">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-gray-600 text-sm">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-500">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Tổng tiền</span>
                  <span className="text-2xl font-bold text-red-500">
                    {formatPrice(orderDetails.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
