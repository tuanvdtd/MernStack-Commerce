import { Link } from "react-router";
import { ShoppingCart, User, LogIn, UserPlus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { userStore } from "~/stores/userStore";

export function Header() {
  const user = userStore((s) => s.user);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center shrink-0">
            <span className="text-2xl font-semibold text-[#00cbfd]">FlashBuy</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/category/all" className="text-sm text-[#2b2f32] hover:text-[#00647e] transition-colors">
              Danh mục
            </Link>
            <Link to="/flash-sale" className="text-sm text-[#2b2f32] hover:text-[#00647e] transition-colors">
              Flash Sale
            </Link>
            <Link to="/category/deals" className="text-sm text-[#2b2f32] hover:text-[#00647e] transition-colors">
              Ưu đãi
            </Link>
            {!user && (
              <span className="text-xs text-muted-foreground hidden lg:inline">
                Xem sản phẩm không cần đăng nhập
              </span>
            )}
            {user && (
              <Link to="/track-order" className="text-sm text-[#2b2f32] hover:text-[#00647e] transition-colors">
                Theo dõi đơn
              </Link>
            )}
          </nav>

          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                className="w-full px-4 py-2 pr-10 bg-[#f8fafc] border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00cbfd] focus:bg-white transition-colors"
              />
              <button type="button" className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-[#00647e] transition-colors" aria-label="Tìm kiếm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link to="/cart" className="relative p-2 hover:text-[#00647e] transition-colors text-[#2b2f32]" aria-label="Giỏ hàng">
                  <ShoppingCart className="w-6 h-6" />
                </Link>
                <Link to="/account" className="p-2 hover:text-[#00647e] transition-colors text-[#2b2f32]" aria-label="Tài khoản">
                  <User className="w-6 h-6" />
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-[#2b2f32]" asChild>
                  <Link to="/login">
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Đăng nhập
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-lg border-0 !bg-[#00cbfd] !text-[#003e4f] shadow-none hover:!bg-[#09b8e8] hover:!text-[#003e4f]"
                  asChild
                >
                  <Link to="/register">
                    <UserPlus className="w-4 h-4 mr-1.5 sm:mr-0" />
                    <span className="hidden sm:inline">Đăng ký</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
