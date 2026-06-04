import { z } from "zod"

export const signUpSchema = z
  .object({
    email: z.string().email(),
    first_name: z.string().min(1, { message: "First Name is required" }),
    last_name: z.string().optional(),
    username: z.string().optional(),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z
      .string()
      .min(1, { message: "Password confirmation is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "The passwords don't match",
    path: ["confirm_password"],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>
