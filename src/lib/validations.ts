/**
 * Zod Validation Schemas
 * Input validation for all API endpoints
 */

import { z } from "zod";

// ============================================================================
// Common Schemas
// ============================================================================

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(254, "Email too long")
  .transform((e) => e.toLowerCase().trim());

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID format");

// ============================================================================
// Auth Schemas
// ============================================================================

export const registerSchema = z.object({
  email: emailSchema,
  authHash: z
    .string()
    .min(64, "Invalid auth hash")
    .max(128, "Invalid auth hash"),
  salt: z.string().min(16, "Invalid salt").max(64, "Invalid salt"),
  encryptedVaultKey: z.string().min(32, "Invalid encrypted vault key"),
  name: z
    .string()
    .min(2, "Name too short")
    .max(100, "Name too long")
    .optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  authHash: z
    .string()
    .min(64, "Invalid auth hash")
    .max(128, "Invalid auth hash"),
});

export const mfaVerifySchema = z.object({
  mfaToken: z.string().min(1, "MFA token required"),
  code: z
    .string()
    .min(6, "Code must be 6 digits")
    .max(8, "Code must be 6-8 characters"),
  method: z.enum(["totp", "email", "backup"]),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required"),
});

// ============================================================================
// Password Entry Schemas
// ============================================================================

export const passwordMetadataSchema = z.object({
  categoryId: objectIdSchema.optional(),
  tags: z.array(z.string().max(50)).max(20),
  favorite: z.boolean(),
  passwordStrength: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
  isCompromised: z.boolean(),
  isReused: z.boolean(),
});

export const createPasswordSchema = z.object({
  encryptedData: z.string().min(1, "Encrypted data required"),
  iv: z.string().min(1, "IV required"),
  metadata: passwordMetadataSchema,
});

export const updatePasswordSchema = z.object({
  encryptedData: z.string().min(1, "Encrypted data required"),
  iv: z.string().min(1, "IV required"),
  metadata: passwordMetadataSchema,
});

// ============================================================================
// Category Schemas
// ============================================================================

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name required").max(50, "Name too long"),
  icon: z.string().max(10, "Icon too long").default("📁"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default("#6B7280"),
  parentId: objectIdSchema.optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Name required").max(50, "Name too long").optional(),
  icon: z.string().max(10, "Icon too long").optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .optional(),
  parentId: objectIdSchema.optional().nullable(),
  order: z.number().int().min(0).optional(),
});

// ============================================================================
// User Settings Schema
// ============================================================================

export const userSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  autoLockMinutes: z
    .union([
      z.literal(1),
      z.literal(5),
      z.literal(15),
      z.literal(30),
      z.literal(60),
    ])
    .optional(),
  clearClipboardSeconds: z
    .union([z.literal(30), z.literal(60), z.literal(90), z.literal(120)])
    .optional(),
  showPasswordStrength: z.boolean().optional(),
  emailOnNewLogin: z.boolean().optional(),
  emailOnPasswordChange: z.boolean().optional(),
  emailSecurityAlerts: z.boolean().optional(),
  defaultView: z.enum(["grid", "list"]).optional(),
  defaultSort: z.enum(["name", "updated", "created"]).optional(),
  showFavicons: z.boolean().optional(),
});

// ============================================================================
// Password Change Schema
// ============================================================================

export const changePasswordSchema = z.object({
  currentAuthHash: z.string().min(64).max(128),
  newAuthHash: z.string().min(64).max(128),
  newSalt: z.string().min(16).max(64),
  reEncryptedVaultKey: z.string().min(32),
  reEncryptedRecoveryData: z.string().optional(),
});

// ============================================================================
// Export Schema
// ============================================================================

export const exportSchema = z.object({
  format: z.enum(["json", "csv", "encrypted"]),
  password: z.string().optional(),
  authHash: z.string().min(64).max(128),
});

// ============================================================================
// MFA Setup Schema
// ============================================================================

export const mfaSetupSchema = z.object({
  secret: z.string(),
  code: z.string().length(6, "Code must be 6 digits"),
});

// ============================================================================
// Type Exports
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type CreatePasswordInput = z.infer<typeof createPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ExportInput = z.infer<typeof exportSchema>;
export type MfaSetupInput = z.infer<typeof mfaSetupSchema>;
