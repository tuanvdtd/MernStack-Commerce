import type { LucideIcon } from "lucide-react"
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Settings,
} from "lucide-react"

export type AccountNavItem = {
  id: string
  label: string
  icon: LucideIcon
  path: string
  count?: number
}

/** Account sidebar config; path is the child segment under /account. */
export const accountNavItems: AccountNavItem[] = [
  { id: "profile", label: "Profile", icon: User, path: "profile" },
  { id: "orders", label: "Orders", icon: Package, path: "orders" },
  { id: "wishlist", label: "Wishlist", icon: Heart, path: "wishlist" },
  { id: "addresses", label: "Addresses", icon: MapPin, path: "addresses" },
  { id: "payment", label: "Payment", icon: CreditCard, path: "payment" },
  { id: "settings", label: "Settings", icon: Settings, path: "settings" },
]
