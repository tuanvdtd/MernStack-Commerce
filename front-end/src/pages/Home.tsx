import { userStore } from "~/stores/userStore";
import { HomeLoggedIn } from "~/pages/HomeLoggedIn";
import { HomeGuest } from "~/pages/HomeGuest";

export function Home() {
  const user = userStore((s) => s.user);
  return user ? <HomeLoggedIn /> : <HomeGuest />;
}
