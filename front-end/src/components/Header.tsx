import { Link } from "react-router";
import { ShoppingCart, User } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [cartCount] = useState(3);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-semibold text-[#00cbfd]">FlashBuy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/category/all" className="text-[#2b2f32] hover:text-[#00647e] transition-colors">
              Categories
            </Link>
            <Link to="/flash-sale" className="text-[#2b2f32] hover:text-[#00647e] transition-colors">
              Flash Sale
            </Link>
            <Link to="/category/deals" className="text-[#2b2f32] hover:text-[#00647e] transition-colors">
              Hot Deals
            </Link>
            <Link to="/track-order" className="text-[#2b2f32] hover:text-[#00647e] transition-colors">
              Tracking
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search product items..."
                className="w-full px-4 py-2 pr-10 bg-[#f8fafc] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00cbfd] focus:bg-white transition-colors"
              />
              <button className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-[#00647e] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-6">
            <Link to="/cart" className="relative hover:text-[#00647e] transition-colors text-[#2b2f32]">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#00cbfd] text-[#003e4f] text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/account" className="hover:text-[#00647e] transition-colors text-[#2b2f32]">
              <User className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

