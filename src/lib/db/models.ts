/**
 * MongoDB Models
 * Mongoose schemas for all collections
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import type {
  User,
  UserSettings,
  PasswordEntry,
  Category,
  Session,
  AuditLog,
  AuditAction,
} from "@/types";

// ============================================================================
// User Model
// ============================================================================

const userSettingsSchema = new Schema<UserSettings>(
  {
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    language: { type: String, default: "en" },
    timezone: { type: String, default: "UTC" },
    autoLockMinutes: { type: Number, default: 15 },
    clearClipboardSeconds: { type: Number, default: 30 },
    showPasswordStrength: { type: Boolean, default: true },
    emailOnNewLogin: { type: Boolean, default: true },
    emailOnPasswordChange: { type: Boolean, default: true },
    emailSecurityAlerts: { type: Boolean, default: true },
    defaultView: { type: String, enum: ["grid", "list"], default: "grid" },
    defaultSort: {
      type: String,
      enum: ["name", "updated", "created"],
      default: "name",
    },
    showFavicons: { type: Boolean, default: true },
  },
  { _id: false },
);

export interface UserDocument extends Omit<User, "_id">, Document {}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },
    name: { type: String, trim: true },
    avatarUrl: { type: String },
    // OAuth users don't have these fields - they're only required for credentials auth
    authHash: { type: String },
    authSalt: { type: String },
    encryptedVaultKey: { type: String },
    // Track the auth provider (credentials, google, etc.)
    authProvider: { type: String, default: "credentials" },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String },
    mfaBackupCodes: [{ type: String }],
    recoveryKeyHash: { type: String },
    encryptedRecoveryData: { type: String },
    settings: { type: userSettingsSchema, default: () => ({}) },
    lastLoginAt: { type: Date },
    lastActiveAt: { type: Date },
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },
    deletionRequestedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

// Indexes
userSchema.index({ status: 1 });
userSchema.index({ createdAt: 1 });

// ============================================================================
// Password Entry Model
// ============================================================================

export interface PasswordEntryDocument
  extends Omit<PasswordEntry, "_id">, Document {}

const passwordEntrySchema = new Schema<PasswordEntryDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    encryptedData: { type: String, required: true },
    iv: { type: String, required: true },
    categoryId: { type: String, index: true },
    tags: [{ type: String }],
    favorite: { type: Boolean, default: false },
    passwordStrength: {
      type: Number,
      enum: [0, 1, 2, 3, 4],
      default: 0,
    },
    isCompromised: { type: Boolean, default: false },
    isReused: { type: Boolean, default: false },
    lastUsedAt: { type: Date },
    passwordChangedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date },
    encryptionVersion: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
passwordEntrySchema.index({ userId: 1, deletedAt: 1 });
passwordEntrySchema.index({ userId: 1, favorite: 1 });
passwordEntrySchema.index({ userId: 1, categoryId: 1 });
passwordEntrySchema.index({ userId: 1, tags: 1 });
passwordEntrySchema.index({ userId: 1, passwordStrength: 1 });
passwordEntrySchema.index({ userId: 1, isCompromised: 1 });
passwordEntrySchema.index({ userId: 1, isReused: 1 });

// ============================================================================
// Category Model
// ============================================================================

export interface CategoryDocument extends Omit<Category, "_id">, Document {}

const categorySchema = new Schema<CategoryDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "📁" },
    color: { type: String, default: "#6B7280" },
    parentId: { type: String },
    order: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ userId: 1, order: 1 });

// ============================================================================
// Session Model
// ============================================================================

export interface SessionDocument extends Omit<Session, "_id">, Document {}

const sessionSchema = new Schema<SessionDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    refreshTokenHash: { type: String, required: true },
    deviceInfo: {
      userAgent: { type: String },
      ip: { type: String },
      country: { type: String },
      city: { type: String },
    },
    expiresAt: { type: Date, required: true },
    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// TTL index for automatic session cleanup
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1, createdAt: -1 });

// ============================================================================
// Audit Log Model
// ============================================================================

export interface AuditLogDocument extends Omit<AuditLog, "_id">, Document {}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "login_failed",
        "mfa_enabled",
        "mfa_disabled",
        "password_created",
        "password_updated",
        "password_deleted",
        "password_viewed",
        "password_copied",
        "export_requested",
        "settings_changed",
        "recovery_key_viewed",
        "session_revoked",
        "account_deleted",
      ] as AuditAction[],
    },
    resourceType: {
      type: String,
      enum: ["password", "category", "user", "session"],
    },
    resourceId: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    geoLocation: {
      country: { type: String },
      city: { type: String },
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, action: 1 });
// TTL index: delete audit logs after 2 years
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

// ============================================================================
// Rate Limit Model (for tracking failed attempts)
// ============================================================================

export interface RateLimitDocument extends Document {
  key: string;
  count: number;
  firstAttempt: Date;
  blockedUntil?: Date;
}

const rateLimitSchema = new Schema<RateLimitDocument>(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 1 },
    firstAttempt: { type: Date, default: Date.now },
    blockedUntil: { type: Date },
  },
  {
    timestamps: true,
  },
);

// TTL index: cleanup old rate limit entries after 24 hours
rateLimitSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

// ============================================================================
// Email Verification Token Model
// ============================================================================

export interface EmailVerificationTokenDocument extends Document {
  email: string;
  token: string;
  code: string; // 6-digit verification code
  expiresAt: Date;
  verified: boolean;
  // Store registration data temporarily until verified
  registrationData?: {
    name?: string;
    authHash: string;
    salt: string;
    encryptedVaultKey: string;
  };
}

const emailVerificationTokenSchema = new Schema<EmailVerificationTokenDocument>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    registrationData: {
      name: { type: String },
      authHash: { type: String },
      salt: { type: String },
      encryptedVaultKey: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

// TTL index: automatically delete expired tokens
emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
emailVerificationTokenSchema.index({ email: 1 });

// ============================================================================
// Model Exports
// ============================================================================

export const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);

export const PasswordEntryModel: Model<PasswordEntryDocument> =
  mongoose.models.PasswordEntry ||
  mongoose.model<PasswordEntryDocument>("PasswordEntry", passwordEntrySchema);

export const CategoryModel: Model<CategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<CategoryDocument>("Category", categorySchema);

export const SessionModel: Model<SessionDocument> =
  mongoose.models.Session ||
  mongoose.model<SessionDocument>("Session", sessionSchema);

export const AuditLogModel: Model<AuditLogDocument> =
  mongoose.models.AuditLog ||
  mongoose.model<AuditLogDocument>("AuditLog", auditLogSchema);

export const RateLimitModel: Model<RateLimitDocument> =
  mongoose.models.RateLimit ||
  mongoose.model<RateLimitDocument>("RateLimit", rateLimitSchema);

export const EmailVerificationTokenModel: Model<EmailVerificationTokenDocument> =
  mongoose.models.EmailVerificationToken ||
  mongoose.model<EmailVerificationTokenDocument>(
    "EmailVerificationToken",
    emailVerificationTokenSchema,
  );
