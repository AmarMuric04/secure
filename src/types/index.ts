/**
 * SecureVault Type Definitions
 * Core types for the password management application
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  _id: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date;

  // Profile
  name?: string;
  avatarUrl?: string;

  // Authentication (server-side only)
  // Optional for OAuth users who authenticate via providers
  authHash?: string;
  authSalt?: string;
  authProvider: "credentials" | "google";

  // Encryption
  // Optional for OAuth users until they set up their vault
  encryptedVaultKey?: string;

  // MFA
  mfaEnabled: boolean;
  mfaSecret?: string;
  mfaBackupCodes?: string[];

  // Recovery
  recoveryKeyHash?: string;
  encryptedRecoveryData?: string;

  // Settings
  settings: UserSettings;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  lastActiveAt?: Date;

  // Status
  status: "active" | "suspended" | "deleted";
  deletionRequestedAt?: Date;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;

  // Security
  autoLockMinutes: number;
  clearClipboardSeconds: number;
  showPasswordStrength: boolean;

  // Notifications
  emailOnNewLogin: boolean;
  emailOnPasswordChange: boolean;
  emailSecurityAlerts: boolean;

  // Display
  defaultView: "grid" | "list";
  defaultSort: "name" | "updated" | "created";
  showFavicons: boolean;
}

export interface UserPublic {
  _id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  avatarUrl?: string;
  mfaEnabled: boolean;
  settings: UserSettings;
  createdAt: Date;
}

// ============================================================================
// Password Entry Types
// ============================================================================

export interface PasswordEntry {
  _id: string;
  userId: string;

  // Encrypted data blob (client-side encryption)
  encryptedData: string;
  iv: string;

  // Metadata (not encrypted, for server-side filtering)
  categoryId?: string;
  tags: string[];
  favorite: boolean;

  // Security Analysis (computed client-side, stored for quick filtering)
  passwordStrength: 0 | 1 | 2 | 3 | 4;
  isCompromised: boolean;
  isReused: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  passwordChangedAt: Date;

  // Soft Delete
  deletedAt?: Date;

  // Encryption version for future migrations
  encryptionVersion: number;
}

// Decrypted password entry (client-side only)
export interface DecryptedPasswordEntry {
  _id: string;
  name: string;
  username?: string;
  password: string;
  urls: string[];
  notes?: string;
  customFields: CustomField[];

  // From PasswordEntry
  categoryId?: string;
  tags: string[];
  favorite: boolean;
  passwordStrength: 0 | 1 | 2 | 3 | 4;
  isCompromised: boolean;
  isReused: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  passwordChangedAt: Date;
}

export interface CustomField {
  id: string;
  name: string;
  value: string;
  type: "text" | "hidden" | "url" | "email" | "phone" | "date";
}

// ============================================================================
// Category Types
// ============================================================================

export interface Category {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  parentId?: string;
  order: number;
  isDefault: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Session Types
// ============================================================================

export interface Session {
  _id: string;
  userId: string;
  refreshTokenHash: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    country?: string;
    city?: string;
  };
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
}

// ============================================================================
// Audit Log Types
// ============================================================================

export type AuditAction =
  | "login"
  | "logout"
  | "login_failed"
  | "mfa_enabled"
  | "mfa_disabled"
  | "password_created"
  | "password_updated"
  | "password_deleted"
  | "password_viewed"
  | "password_copied"
  | "export_requested"
  | "settings_changed"
  | "recovery_key_viewed"
  | "session_revoked";

export interface AuditLog {
  _id: string;
  userId: string;
  action: AuditAction;
  resourceType: "password" | "category" | "user" | "session";
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  geoLocation?: {
    country: string;
    city: string;
  };
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Auth API Types
export interface RegisterRequest {
  email: string;
  authHash: string;
  salt: string;
  encryptedVaultKey: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  authHash: string;
}

export interface RegisterResponse {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
  encryptedVaultKey: string;
  salt: string;
}

export interface LoginResponse {
  requiresMfa: boolean;
  mfaToken?: string;
  user?: UserPublic;
  accessToken?: string;
  refreshToken?: string;
  encryptedVaultKey?: string;
  salt?: string;
}

export interface MfaVerifyRequest {
  mfaToken: string;
  code: string;
  method: "totp" | "email" | "backup";
}

export interface MfaVerifyResponse {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
  encryptedVaultKey: string;
  salt: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Vault API Types
export interface VaultResponse {
  passwords: PasswordEntry[];
  categories: Category[];
  tags: string[];
  lastModified: Date;
  version: number;
}

export interface CreatePasswordRequest {
  encryptedData: string;
  iv: string;
  metadata: {
    categoryId?: string;
    tags: string[];
    favorite: boolean;
    passwordStrength: 0 | 1 | 2 | 3 | 4;
    isCompromised: boolean;
    isReused: boolean;
  };
}

export interface UpdatePasswordRequest {
  encryptedData: string;
  iv: string;
  metadata: {
    categoryId?: string;
    tags: string[];
    favorite: boolean;
    passwordStrength: 0 | 1 | 2 | 3 | 4;
    isCompromised: boolean;
    isReused: boolean;
  };
}

// ============================================================================
// JWT Payload Types
// ============================================================================

export interface JWTPayload {
  sub: string; // userId
  email: string;
  type: "access" | "refresh" | "mfa";
  iat: number;
  exp: number;
}

export interface MfaTokenPayload {
  sub: string;
  email: string;
  type: "mfa";
  iat: number;
  exp: number;
}
