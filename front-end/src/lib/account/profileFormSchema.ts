import { z } from "zod"

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Họ tên không được để trống")
    .max(100, "Họ tên tối đa 100 ký tự"),
  email: z.string().email(),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0")
    .or(z.literal("")),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
