/** Token màu thống nhất cho trang catalog — kiểu ecommerce VN (Shopee/Tiki) */
export const storeTokens = {
  pageBg: "bg-[#f5f5f5]",
  surface: "bg-white",
  sidebarBg: "bg-[#fafafa]",
  bandBg: "bg-[#fafafa]",
  border: "border-gray-200",
  text: "text-[#2b2f32]",
  textMuted: "text-[#757575]",
  brand: "text-[#00cbfd]",
  brandBg: "bg-[#00cbfd]",
  brandText: "text-[#003e4f]",
  brandTint: "bg-[#e8f9fd]",
  price: "text-[#ee4d2d]",
  activeItem:
    "border-[#00cbfd] bg-white font-medium text-[#2b2f32]",
  inactiveItem:
    "border-transparent bg-transparent text-[#2b2f32]",
  iconBox: "bg-[#f0f0f0] text-[#666666]",
  iconBoxActive: "bg-[#00cbfd] text-[#003e4f]",
} as const

/** Giữ API cũ nhưng trả về palette ecommerce thống nhất — không đổi màu theo danh mục */
export type CategoryAccent = {
  iconClass: string
  activeClass: string
  tintClass: string
  labelClass: string
}

const unifiedAccent: CategoryAccent = {
  iconClass: storeTokens.iconBoxActive,
  activeClass: storeTokens.activeItem,
  tintClass: storeTokens.bandBg,
  labelClass: "text-[#00647e]",
}

export const getCategoryAccent = (): CategoryAccent => unifiedAccent

export const getCategoryIconAccent = (_categoryId: string, isActive = false): string =>
  isActive ? storeTokens.iconBoxActive : storeTokens.iconBox
