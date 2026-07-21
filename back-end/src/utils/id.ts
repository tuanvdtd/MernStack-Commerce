import { uuidv7 } from 'uuidv7'

/**
 * Sinh id UUID v7 cho bản ghi mới (Category, Product, Variant, …).
 * Yêu cầu package `uuidv7` — cài bằng: npm install uuidv7 (trong thư mục back-end).
 */
export function newId(): string {
  return uuidv7()
}
