/** Human-readable order code, e.g. ORD20260904483920. Uniqueness enforced by Order.orderNumber @unique + retry. */
export function generateOrderNumber(): string {
  const now = new Date()
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`
  const randomPart = Math.floor(100000 + Math.random() * 900000)
  return `ORD${datePart}${randomPart}`
}
