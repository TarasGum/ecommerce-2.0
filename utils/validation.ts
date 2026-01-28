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

// Change password form schema
export const changePasswordSchema = z
  .object({
    old_password: z
      .string()
      .min(1, "Current password is required")
      .min(8, "Password must be at least 8 characters"),
    new_password: z
      .string()
      .min(1, "New password is required")
      .min(8, "Password must be at least 8 characters"),
    new_password_confirm: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: "Passwords do not match",
    path: ["new_password_confirm"],
  })
  .refine((data) => data.new_password !== data.old_password, {
    message: "New password must be different from current password",
    path: ["new_password"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

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

// ==================== PROJECT SCHEMAS ====================

// Database type options
export const DB_TYPES = ['postgresql', 'mysql', 'mssql', 'oracle'] as const;

// Create project form schema
export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
  db_type: z.string().min(1, "Database type is required"),
  db_host: z.string().min(1, "Database host is required"),
  db_port: z.coerce.number().int().positive("Port must be a positive number").max(65535, "Port must be less than 65535"),
  db_name: z.string().min(1, "Database name is required"),
  db_username: z.string().min(1, "Database username is required"),
  db_password: z.string().min(1, "Database password is required"),
  api_endpoint: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  api_login: z.string().optional(),
  api_password: z.string().optional(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

// Edit project form schema (passwords optional)
export const editProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
  db_type: z.string().min(1, "Database type is required"),
  db_host: z.string().min(1, "Database host is required"),
  db_port: z.coerce.number().int().positive("Port must be a positive number").max(65535, "Port must be less than 65535"),
  db_name: z.string().min(1, "Database name is required"),
  db_username: z.string().min(1, "Database username is required"),
  db_password: z.string().optional(), // Optional in edit mode
  api_endpoint: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  api_login: z.string().optional(),
  api_password: z.string().optional(),
});

export type EditProjectFormData = z.infer<typeof editProjectSchema>;
