import { Package, MapPin, CheckCircle, Truck, Clock, XCircle } from "lucide-react"
import { useState } from "react"
import { trackOrder, type OrderTrackingResult } from "~/apis/orderApi"

const STEP_ORDER = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const

export function TrackOrder() {
  const [orderCode, setOrderCode] = useState("")
  const [phone, setPhone] = useState("")
  const [order, setOrder] = useState<OrderTrackingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async () => {
    if (!orderCode.trim() || !phone.trim()) return
    setError(null)
    try {
      setOrder(await trackOrder(orderCode.trim(), phone.trim()))
    } catch {
      setOrder(null)
      setError("Order not found. Check the order code and phone number.")
    }
  }

  const formatPrice = (price: number) => `${price.toLocaleString("en-US")} VND`

  const currentStepIndex = order
    ? order.orderStatus === "CANCELLED"
      ? -1
      : STEP_ORDER.indexOf(order.orderStatus as (typeof STEP_ORDER)[number])
    : -1

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Track order</h1>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-3">Order code</label>
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="Example: ORD20260904123456"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0ACDFF] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-3">
                Recipient phone number
              </label>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0ACDFF] focus:border-transparent"
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                />
                <button
                  onClick={handleTrack}
                  className="bg-[#0ACDFF] hover:bg-[#09b8e8] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Track
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Both the order code and the recipient phone number are required.
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        {order && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Order #{order.orderNumber}</h2>
                  <p className="text-gray-600">
                    Ordered at {new Date(order.createdAt).toLocaleString("en-US")}
                  </p>
                </div>
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center">
                  {order.orderStatus === "CANCELLED" ? (
                    <XCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <Truck className="w-5 h-5 mr-2" />
                  )}
                  {order.orderStatus}
                </div>
              </div>

              <div className="relative">
                {STEP_ORDER.map((step, index) => (
                  <div key={step} className="flex mb-8 last:mb-0">
                    <div className="flex flex-col items-center mr-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentStepIndex >= index
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-500"
                        }`}
                      >
                        {currentStepIndex >= index ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Clock className="w-6 h-6" />
                        )}
                      </div>
                      {index < STEP_ORDER.length - 1 && (
                        <div
                          className={`w-1 h-16 ${
                            currentStepIndex > index ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="font-semibold text-gray-900 mb-1">{step}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[#0ACDFF]" />
                Shipping information
              </h3>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping address</span>
                <span className="font-semibold text-right max-w-md">
                  {order.addressDetail}, {order.wardName}, {order.provinceName}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-[#0ACDFF]" />
                Products in order
              </h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                      <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-500">{formatPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-red-500">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
