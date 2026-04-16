import { createBrowserRouter } from "react-router";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomeLoggedIn },
      { path: "guest", Component: HomeGuest },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "category/:slug", Component: Category },
      { path: "flash-sale", Component: FlashSale },
      { path: "track-order", Component: TrackOrder },
      { path: "account", Component: Account },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
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