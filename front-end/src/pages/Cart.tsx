import { Link } from "react-router";
import { useState } from "react";
import svgPaths from "~/imports/svg-cart";

interface CartItem {
  id: string;
  name: string;
  variant: string;
  image: string;
  price: number;
  quantity: number;
  selected: boolean;
}

export function Cart() {
  const [selectAll, setSelectAll] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Giày Chạy Bộ FlashVelocity Ultra-Light Pro",
      variant: "Màu sắc: Crimson Red | Size: 42",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 1250000,
      quantity: 1,
      selected: true,
    },
    {
      id: "2",
      name: "Đồng Hồ Thông Minh Velocity Horizon Gen 4",
      variant: "Màu sắc: Space Gray | Dây: Sport Loop",
      image: "https://images.unsplash.com/photo-1758348844355-2ef28345979d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 4990000,
      quantity: 1,
      selected: true,
    },
    {
      id: "3",
      name: "Tai Nghe Không Dây FlashSound Elite Noise Cancelling",
      variant: "Màu sắc: Midnight Black",
      image: "https://images.unsplash.com/photo-1598900863662-da1c3e6dd9d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      price: 2100000,
      quantity: 2,
      selected: false,
    },
  ]);

  const [voucherCode, setVoucherCode] = useState("");
  const voucherDiscount = 150000;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setCartItems(items => items.map(item => ({ ...item, selected: newValue })));
  };

  const toggleItemSelection = (id: string) => {
    setCartItems(items => items.map(item =>
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const removeSelected = () => {
    setCartItems(items => items.filter(item => !item.selected));
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 35000;
  const discount = voucherDiscount;
  const total = subtotal + shipping - discount;

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-[#2b2f32] tracking-[-0.9px] leading-10 mb-2">Giỏ hàng của bạn</h1>
          <p className="text-[#585c5f]">
            Bạn có <span className="text-[#00647e]">{cartItems.length} sản phẩm</span> trong danh sách mua sắm.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Bulk Actions Bar */}
            <div className="bg-[#edf1f4] rounded-xl p-4 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-[#aaadb0] text-[#00647e] focus:ring-[#00647e]"
                />
                <span className="text-sm text-[#585c5f]">Chọn tất cả</span>
              </label>
              <button onClick={removeSelected} className="text-sm text-[#b31b25] hover:text-[#9f0519]">
                Xóa mục đã chọn
              </button>
            </div>

            {/* Cart Items List */}
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="flex items-start pt-1">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-[22px] h-[22px] rounded border-[#aaadb0] text-[#00647e] focus:ring-[#00647e]"
                    />
                  </div>

                  {/* Product Image */}
                  <div className="bg-[#e4e9ec] rounded-lg w-32 h-32 flex-shrink-0 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg text-[#2b2f32] leading-7 mb-1">{item.name}</h3>
                      <p className="text-sm text-[#585c5f] leading-5">{item.variant}</p>
                    </div>

                    {/* Quantity and Delete */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="bg-[#edf1f4] rounded-full flex items-center gap-4 px-4 py-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <svg className="w-[10.5px] h-[1.5px]" fill="none" viewBox="0 0 10.5 1.5">
                            <path d="M0 1.5V0H10.5V1.5H0V1.5" fill="#00647E" />
                          </svg>
                        </button>
                        <span className="text-sm text-[#2b2f32] min-w-[16px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <svg className="w-[10.5px] h-[10.5px]" fill="none" viewBox="0 0 10.5 10.5">
                            <path d={svgPaths.p38ac19c0} fill="#00647E" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <svg className="w-[13.333px] h-[15px]" fill="none" viewBox="0 0 13.3333 15">
                          <path d={svgPaths.pd83d200} fill="#585C5F" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col items-end justify-between min-w-[140px] pl-6">
                    <div className="text-xl text-[#002733] leading-7">{formatPrice(item.price)}</div>
                    <div className="text-right">
                      <div className="text-xs text-[#585c5f] uppercase tracking-wider leading-4 mb-1">
                        Thành tiền
                      </div>
                      <div className="text-lg text-[#00647e] leading-7">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-[#2b2f32] mb-6">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[#585c5f]">
                  <span>Tạm tính ({selectedItems.length} sản phẩm)</span>
                  <span className="text-[#2b2f32]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#585c5f]">
                  <span>Phí vận chuyển</span>
                  <span className="text-[#2b2f32]">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-[#585c5f]">
                  <span>Giảm giá voucher</span>
                  <span className="text-[#b31b25]">-{formatPrice(discount)}</span>
                </div>

                {/* Voucher Input */}
                <div className="pt-3">
                  <div className="text-xs text-[#585c5f] uppercase tracking-wider mb-2">Mã giảm giá</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="FLASH2024"
                      className="flex-1 px-3 py-2 border border-[#dee3e7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00cbfd]"
                    />
                    <button className="bg-[#00647e] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#00576e] transition-colors">
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#dee3e7] pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-[#2b2f32]">Tổng cộng</span>
                  <span className="text-2xl font-bold text-[#00647e]">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-gradient-to-r from-[#00647e] to-[#00cbfd] text-white text-center py-4 rounded-full font-semibold hover:shadow-lg transition-all mb-3"
              >
                Thanh toán ngay
              </Link>

              <p className="text-xs text-center text-[#585c5f]">
                🔒 Thanh toán an toàn & bảo mật
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
