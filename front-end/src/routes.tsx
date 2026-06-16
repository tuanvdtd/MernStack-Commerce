import { createBrowserRouter, Outlet, Navigate } from "react-router";
import { ScrollToTop } from "~/components/ScrollToTop";
import { RootLayout } from "~/layouts/RootLayout";
import { Home } from "~/pages/Home";
import { ProductDetail } from "~/pages/ProductDetail";
import { Cart } from "~/pages/Cart";
import { Checkout } from "~/pages/Checkout";
import { Category } from "~/pages/Category";
import { FlashSale } from "~/pages/FlashSale";
import { TrackOrder } from "~/pages/TrackOrder";
import { Account } from "~/pages/Account";
import { AccountV2 } from "~/pages/AccountV2";
import { AccountProfile } from "~/pages/account/AccountProfile";
import { AccountOrders } from "~/pages/account/AccountOrders";
import { AccountWishlist } from "~/pages/account/AccountWishlist";
import { AccountAddresses } from "~/pages/account/AccountAddresses";
import { AccountPayment } from "~/pages/account/AccountPayment";
import { AccountSettings } from "~/pages/account/AccountSettings";
import { Login } from "~/pages/Login";
import { Register } from "~/pages/Register";
import { VerifyOtp } from "~/pages/VerifyOtp";
import { NotFound } from "~/pages/NotFound";
import { AdminLayout } from "~/layouts/AdminLayout";
import { Dashboard } from "~/pages/admin/Dashboard";
import { ProductsList } from "~/pages/admin/ProductsList";
import { ProductForm } from "~/pages/admin/ProductForm";
import { Inventory } from "~/pages/admin/Inventory";
import { OrdersList } from "~/pages/admin/OrdersList";
import { OrderDetail } from "~/pages/admin/OrderDetail";
import { DiscountsList } from "~/pages/admin/DiscountsList";
import { DiscountForm } from "~/pages/admin/DiscountForm";
import { permissions, getLoginRedirectPath } from "~/config/rbacConfig";
import { usePermission } from "~/hooks/usePermission";
import { userStore } from "~/stores/userStore";

// eslint-disable-next-line react-refresh/only-export-components
const UserRoute = () => {
  const user = userStore((s) => s.user);
  const { hasPermission } = usePermission(user?.role);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!hasPermission(permissions.VIEW_USER)) {
    return <Navigate to={getLoginRedirectPath(user.role)} replace />;
  }
  return <Outlet />;
};

// eslint-disable-next-line react-refresh/only-export-components
const AdminRoute = () => {
  const user = userStore((s) => s.user);
  const { hasPermission } = usePermission(user?.role);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!hasPermission(permissions.VIEW_ADMIN)) {
    return <Navigate to={getLoginRedirectPath(user.role)} replace />;
  }
  return <Outlet />;
};

// eslint-disable-next-line react-refresh/only-export-components
const LoginedRedirect = () => {
  const user = userStore((s) => s.user);
  if (user) {
    return <Navigate to={getLoginRedirectPath(user.role)} replace />;
  }
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      // Public routes: everyone can access these.
      { index: true, Component: Home },
      { path: "product/:id", Component: ProductDetail },
      { path: "category/:slug", Component: Category },
      { path: "flash-sale", Component: FlashSale },
      { path: "*", Component: NotFound },

      // Protected routes: only the user role can access these.
      {
        Component: UserRoute,
        children: [
          { path: "cart", Component: Cart },
          { path: "checkout", Component: Checkout },
          { path: "track-order", Component: TrackOrder },
          {
            path: "account",
            Component: AccountV2,
            children: [
              { index: true, element: <Navigate to="profile" replace /> },
              { path: "profile", Component: AccountProfile },
              { path: "orders", Component: AccountOrders },
              { path: "wishlist", Component: AccountWishlist },
              { path: "addresses", Component: AccountAddresses },
              { path: "payment", Component: AccountPayment },
              { path: "settings", Component: AccountSettings },
            ],
          },
          { path: "account-old", Component: Account },
        ],
      },
    ],
  },
  // Redirect signed-in users away from login/register.
  {
    Component: LoginedRedirect,
    children: [
      { path: "/login", Component: Login },
      { path: "/register", Component: Register },
      { path: "/verify-otp", Component: VerifyOtp },
    ],
  },
  {
    path: "/admin",
    Component: AdminRoute,
    children: [
      {
        Component: AdminLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "products", Component: ProductsList },
          { path: "products/create", Component: ProductForm },
          { path: "products/edit/:id", Component: ProductForm },
          { path: "inventory", Component: Inventory },
          { path: "orders", Component: OrdersList },
          { path: "orders/:id", Component: OrderDetail },
          { path: "discounts", Component: DiscountsList },
          { path: "discounts/create", Component: DiscountForm },
          { path: "discounts/edit/:id", Component: DiscountForm },
        ],
      },
    ],
  },
]);
