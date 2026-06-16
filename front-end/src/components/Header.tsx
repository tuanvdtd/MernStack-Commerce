import { Link, useLocation } from "react-router";
import { ShoppingCart, LogIn, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { getUserInitials } from "~/lib/admin/ui";
import { userStore } from "~/stores/userStore";
import { cn } from "~/lib/utils";

function navLinkClass(isActive: boolean) {
  return cn(
    "relative text-sm pb-1 transition-colors",
    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#00cbfd] after:origin-center after:scale-x-0 after:transition-transform after:duration-300 after:ease-out",
    isActive
      ? "text-[#00647e] font-semibold after:scale-x-100"
      : "text-[#2b2f32] hover:text-[#00647e] hover:after:scale-x-100"
  );
}

function iconLinkClass(isActive: boolean) {
  return cn(
    "p-2 transition-colors",
    isActive ? "text-[#00647e]" : "text-[#2b2f32] hover:text-[#00647e]"
  );
}

export function Header() {
  const user = userStore((s) => s.user);
  const { pathname } = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center shrink-0">
            <span className="text-2xl font-semibold text-[#00cbfd]">FlashBuy</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/category/all"
              className={navLinkClass(pathname.startsWith("/category"))}
            >
              Categories
            </Link>
            <Link
              to="/flash-sale"
              className={navLinkClass(pathname.startsWith("/flash-sale"))}
            >
              Flash Sale
            </Link>
            {/* <Link to="/category/deals" className={navLinkClass(pathname.startsWith("/category/deals"))}>
              Deals
            </Link> */}
            {!user && (
              <span className="text-xs text-muted-foreground hidden lg:inline">
                Browse products without signing in
              </span>
            )}
            {user && (
              <Link
                to="/track-order"
                className={navLinkClass(pathname.startsWith("/track-order"))}
              >
                Track order
              </Link>
            )}
          </nav>

          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pr-10 bg-[#f8fafc] border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00cbfd] focus:bg-white transition-colors"
              />
              <button type="button" className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-[#00647e] transition-colors" aria-label="Search">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  to="/cart"
                  className={cn("relative", iconLinkClass(pathname.startsWith("/cart")))}
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-6 h-6" />
                </Link>
                <Link
                  to="/account"
                  className="p-1"
                  aria-label="Account"
                  aria-current={
                    pathname.startsWith("/account") ? "page" : undefined
                  }
                >
                  <Avatar
                    className={cn(
                      "size-9 border-2 transition-colors",
                      pathname.startsWith("/account")
                        ? "border-[#00cbfd]"
                        : "border-transparent"
                    )}
                  >
                    <AvatarImage src={user.profilePic} alt={user.name} />
                    <AvatarFallback className="bg-[#00cbfd]/10 text-xs font-medium text-[#00647e]">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-[#2b2f32]" asChild>
                  <Link to="/login">
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Sign in
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
                    <span className="hidden sm:inline">Sign up</span>
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
