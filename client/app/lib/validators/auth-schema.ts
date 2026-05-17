import { z } from "zod";

export const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be more than 3 characters."),
    email: z.email("Please enter a valid email."),
    firstName: z.string().min(2, "First name is required."),
    lastName: z.string().min(2, "Last name is required."),
    age: z.coerce.number().min(16, "Must be 16 or older."),
    password: z
      .string()
      .min(6, "Password must be more than 6 characters.")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/, {
        message:
          "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// 1. This represents the raw input data before validation (Age can be string/number)
export type RegisterInput = z.input<typeof registerSchema>;

// 2. This represents the strictly parsed output data after validation (Age is safely a number)
export type RegisterOutput = z.output<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.input<typeof loginSchema>;
export type LoginOutput = z.output<typeof loginSchema>;
