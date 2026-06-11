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

/** Cấu hình sidebar tài khoản — path là segment con của /account. */
export const accountNavItems: AccountNavItem[] = [
  { id: "profile", label: "Thông tin cá nhân", icon: User, path: "profile" },
  { id: "orders", label: "Đơn hàng", icon: Package, path: "orders" },
  { id: "wishlist", label: "Yêu thích", icon: Heart, path: "wishlist" },
  { id: "addresses", label: "Địa chỉ", icon: MapPin, path: "addresses" },
  { id: "payment", label: "Thanh toán", icon: CreditCard, path: "payment" },
  { id: "settings", label: "Cài đặt", icon: Settings, path: "settings" },
]
