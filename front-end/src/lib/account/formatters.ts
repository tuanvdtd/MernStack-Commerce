/** Định dạng giá VND cho trang tài khoản. */
export const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)

/** Định dạng ngày tham gia từ ISO string. */
export const formatJoinDate = (isoDate: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate))
