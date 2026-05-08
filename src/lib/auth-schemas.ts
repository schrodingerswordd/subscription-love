import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .email({ message: "Enter a valid email address" })
  .max(255, { message: "Email is too long" });

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(128, { message: "Password is too long" }),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password is too long" })
    .regex(/[A-Za-z]/, { message: "Include at least one letter" })
    .regex(/[0-9]/, { message: "Include at least one number" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
