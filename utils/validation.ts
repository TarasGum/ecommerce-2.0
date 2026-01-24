// utils/validation.ts
// Shared Zod validation schemas

import { z } from "zod";
import { USER_ROLES } from "./constants";

// Login form schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Create user form schema
export const createUserSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    password_confirm: z.string().min(1, "Please confirm your password"),
    role: z.string().min(1, "User type is required"),
    project: z.number().nullable().optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  })
  .refine(
    (data) => {
      // Project is required for admin and user roles, but not for superadmin
      if (data.role === USER_ROLES.SUPERADMIN) return true;
      return data.project !== null && data.project !== undefined;
    },
    {
      message: "Project is required for admin and user roles",
      path: ["project"],
    }
  );

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Edit user form schema (password optional)
export const editUserSchema = (changePassword: boolean) => {
  if (changePassword) {
    return z
      .object({
        name: z.string().min(1, "Name is required"),
        email: z
          .string()
          .min(1, "Email is required")
          .email("Please enter a valid email address"),
        role: z.string().min(1, "User type is required"),
        project: z.number().nullable().optional(),
        password: z
          .string()
          .min(1, "Password is required")
          .min(8, "Password must be at least 8 characters"),
        password_confirm: z.string().min(1, "Please confirm your password"),
      })
      .refine(
        (data) => {
          // Project is required for admin and user roles, but not for superadmin
          if (data.role === USER_ROLES.SUPERADMIN) return true;
          return data.project !== null && data.project !== undefined;
        },
        {
          message: "Project is required for admin and user roles",
          path: ["project"],
        }
      )
      .refine((data) => data.password === data.password_confirm, {
        message: "Passwords do not match",
        path: ["password_confirm"],
      });
  }

  return z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
      role: z.string().min(1, "User type is required"),
      project: z.number().nullable().optional(),
      password: z.string().optional(),
      password_confirm: z.string().optional(),
    })
    .refine(
      (data) => {
        // Project is required for admin and user roles, but not for superadmin
        if (data.role === USER_ROLES.SUPERADMIN) return true;
        return data.project !== null && data.project !== undefined;
      },
      {
        message: "Project is required for admin and user roles",
        path: ["project"],
      }
    );
};
