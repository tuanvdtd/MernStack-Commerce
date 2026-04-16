import { useState } from "react";
import svgPaths from "~/imports/svg-checkout";

export function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod" | "ewallet">("card");
  const [voucherCode, setVoucherCode] = useState("");

  const orderItems = [
    {
      id: "1",
      name: "Velocity Chronograph - Midnight Edition",
      variant: "Size: 42mm | Color: Obsidian Black",
      quantity: 1,
      price: 1250,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    {
      id: "2",
      name: "Aero-Form Runners Pro",
      variant: "Size: 10 | Color: Storm Gray",
      quantity: 1,
      price: 210,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // FREE
  const estimatedTax = 136.8;
  const voucherDiscount = 20;
  const total = subtotal + shipping + estimatedTax - voucherDiscount;

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-[#2b2f32] tracking-[-0.9px] leading-10 mb-2">Checkout</h1>
          <p className="text-[#585c5f]">Complete your order with Velocity Editorial precision.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-[0px_20px_40px_0px_rgba(0,100,126,0.08)] p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-[#00cbfd] rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-sm text-[#003e4f]">1</span>
                  </div>
                  <h2 className="text-xl text-[#2b2f32] tracking-[-0.5px] leading-7">Delivery Address</h2>
                </div>
                <button className="text-sm text-[#00647e] hover:text-[#00576e]">Edit</button>
              </div>

              <div className="bg-[#edf1f4] rounded-lg p-6 border border-[rgba(0,100,126,0.15)]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[#2b2f32] mb-1">Alex Harrington</h3>
                    <p className="text-sm text-[#585c5f] leading-[22.75px]">
                      88 Market Street, Unit 402<br />
                      Financial District, San Francisco, CA 94105<br />
                      +1 (555) 012-3456
                    </p>
                  </div>
                  <svg className="w-4 h-5 flex-shrink-0" fill="none" viewBox="0 0 16 20">
                    <path d={svgPaths.p1869180} fill="#00576E" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Order Review */}
            <div className="bg-white rounded-xl shadow-[0px_20px_40px_0px_rgba(0,100,126,0.08)] p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-[#00cbfd] rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-sm text-[#003e4f]">2</span>
                </div>
                <h2 className="text-xl text-[#2b2f32] tracking-[-0.5px] leading-7">Order Review</h2>
              </div>

              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-6">
                    <div className="bg-[#edf1f4] rounded-lg w-24 h-24 flex-shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 py-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-sm text-[#2b2f32] leading-5">{item.name}</h3>
                        <span className="text-[#00647e]">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-[#585c5f] leading-4 mb-2">{item.variant}</p>
                      <div className="bg-[#dee3e7] rounded px-2 py-1 inline-block">
                        <span className="text-xs text-[#585c5f]">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-[0px_20px_40px_0px_rgba(0,100,126,0.08)] p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-[#00cbfd] rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-sm text-[#003e4f]">3</span>
                </div>
                <h2 className="text-xl text-[#2b2f32] tracking-[-0.5px] leading-7">Payment Method</h2>
              </div>

              {/* Payment Options */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === "card"
                      ? "border-[#00647e] bg-[#f0f9ff]"
                      : "border-[#dee3e7] hover:border-[#aaadb0]"
                  }`}
                >
                  <svg className="w-10 h-7" fill="none" viewBox="0 0 40 28">
                    <rect width="40" height="28" rx="4" fill="#dee3e7" />
                    <rect x="4" y="4" width="32" height="6" rx="2" fill="#585c5f" />
                    <rect x="4" y="16" width="12" height="4" rx="2" fill="#585c5f" />
                  </svg>
                  <span className="text-sm text-[#2b2f32]">Credit Card</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === "cod"
                      ? "border-[#00647e] bg-[#f0f9ff]"
                      : "border-[#dee3e7] hover:border-[#aaadb0]"
                  }`}
                >
                  <svg className="w-10 h-7" fill="none" viewBox="0 0 40 28">
                    <rect x="2" y="2" width="36" height="24" rx="3" stroke="#585c5f" strokeWidth="2" fill="white" />
                    <path d="M20 9V19M15 14H25" stroke="#585c5f" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-sm text-[#2b2f32]">COD</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("ewallet")}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === "ewallet"
                      ? "border-[#00647e] bg-[#f0f9ff]"
                      : "border-[#dee3e7] hover:border-[#aaadb0]"
                  }`}
                >
                  <svg className="w-10 h-7" fill="none" viewBox="0 0 40 28">
                    <rect width="40" height="28" rx="4" fill="#00647e" />
                    <path d="M12 14L18 20L28 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm text-[#2b2f32]">E-wallet</span>
                </button>
              </div>

              {/* Card Details Form */}
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#585c5f] uppercase tracking-wider mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="**** **** **** 4242"
                      className="w-full px-4 py-3 border border-[#dee3e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00cbfd]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#585c5f] uppercase tracking-wider mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-[#dee3e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00cbfd]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#585c5f] uppercase tracking-wider mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="***"
                        className="w-full px-4 py-3 border border-[#dee3e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00cbfd]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              {/* Promotions */}
              <div className="mb-6">
                <h3 className="text-xs text-[#585c5f] uppercase tracking-wider mb-3">Promotions</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Enter voucher code"
                    className="flex-1 px-3 py-2 border border-[#dee3e7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00cbfd]"
                  />
                  <button className="bg-[#2b2f32] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1a1d1f] transition-colors">
                    Apply
                  </button>
                </div>
                <p className="text-xs text-[#00647e] mt-2">🎉 VELOCITY applied! -$20.00</p>
              </div>

              {/* Order Summary */}
              <div className="border-t border-[#dee3e7] pt-6">
                <h3 className="text-xs text-[#585c5f] uppercase tracking-wider mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between text-[#585c5f]">
                    <span>Subtotal</span>
                    <span className="text-[#2b2f32]">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#585c5f]">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-[#585c5f]">
                    <span>Estimated Tax</span>
                    <span className="text-[#2b2f32]">${estimatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#585c5f]">
                    <span>Voucher Discount</span>
                    <span className="text-[#b31b25]">-${voucherDiscount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-[#dee3e7] pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-[#2b2f32]">Total</span>
                    <span className="text-2xl font-bold text-[#00647e]">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-[#00647e] to-[#00cbfd] text-white py-4 rounded-full font-semibold hover:shadow-lg transition-all mb-3">
                  ĐẶT HÀNG
                </button>

                <p className="text-xs text-center text-[#585c5f]">
                  By placing your order you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
