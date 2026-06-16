/** Format VND prices on account pages. */
export const formatPrice = (price: number) =>
  `${price.toLocaleString("en-US")} VND`

/** Format the join date from an ISO string. */
export const formatJoinDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate))
