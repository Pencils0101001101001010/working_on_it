import { z } from "zod";

export const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be more than 3 characters."),
    email: z.email("Please enter a valid email."),
    firstName: z.string().min(2, "First name is required."),
    lastName: z.string().min(2, "Last name is required."),
    age: z.coerce.number().min(16, "Must be 16 or older."),
    password: z.string().min(6, "Password must be more than 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

//creating like a typescript interface:
export type RegisterSchema = z.infer<typeof registerSchema>;
