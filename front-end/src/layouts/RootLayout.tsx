import { Outlet } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { ScrollToTop } from "~/components/ScrollToTop";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
