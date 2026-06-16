import { z } from "zod"

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be at most 100 characters"),
  email: z.string().email(),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Phone number must be 10 digits and start with 0")
    .or(z.literal("")),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
