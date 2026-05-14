import { createBrowserRouter, Outlet, Navigate } from "react-router";
import { RootLayout } from "~/layouts/RootLayout";
import { HomeLoggedIn } from "~/pages/HomeLoggedIn";
import { HomeGuest } from "~/pages/HomeGuest";
import { ProductDetail } from "~/pages/ProductDetail";
import { Cart } from "~/pages/Cart";
import { Checkout } from "~/pages/Checkout";
import { Category } from "~/pages/Category";
import { FlashSale } from "~/pages/FlashSale";
import { TrackOrder } from "~/pages/TrackOrder";
import { Account } from "~/pages/Account";
import { Login } from "~/pages/Login";
import { Register } from "~/pages/Register";
import { NotFound } from "~/pages/NotFound";
import { AdminLayout } from "~/layouts/AdminLayout";
import { Dashboard } from "~/pages/admin/Dashboard";
import { ProductsList } from "~/pages/admin/ProductsList";
import { ProductForm } from "~/pages/admin/ProductForm";
import { Inventory } from "~/pages/admin/Inventory";
import { OrdersList } from "~/pages/admin/OrdersList";
import { OrderDetail } from "~/pages/admin/OrderDetail";
import { userStore } from "~/stores/userStore";

const ProtectedRoute = () => {
  const user = userStore.getState().user;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />; // nếu có user trong storage thì chuyển xuống các route con trong route cha
};

const LoginedRedirect = () => {
  const user = userStore.getState().user;
  if (user && user.isAdmin) {
    return <Navigate to="/admin/products" replace />;
  } else if (user) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />; // chưa đăng nhập thì cho vào login/register
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      // Public routes - ai cũng truy cập được
      { index: true, Component: HomeLoggedIn },
      { path: "guest", Component: HomeGuest },
      { path: "product/:id", Component: ProductDetail },
      { path: "category/:slug", Component: Category },
      { path: "flash-sale", Component: FlashSale },
      { path: "*", Component: NotFound },

      // Protected routes - phải đăng nhập mới truy cập được
      {
        Component: ProtectedRoute,
        children: [
          { path: "cart", Component: Cart },
          { path: "checkout", Component: Checkout },
          { path: "track-order", Component: TrackOrder },
          { path: "account", Component: Account },
        ],
      },
    ],
  },
  // Đã đăng nhập rồi thì redirect đi, không cho vào login/register
  {
    Component: LoginedRedirect,
    children: [
      { path: "/login", Component: Login },
      { path: "/register", Component: Register },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "products", Component: ProductsList },
      { path: "products/create", Component: ProductForm },
      { path: "products/edit/:id", Component: ProductForm },
      { path: "inventory", Component: Inventory },
      { path: "orders", Component: OrdersList },
      { path: "orders/:id", Component: OrderDetail },
    ],
  },
]);