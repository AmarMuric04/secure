# SecureVault - Password Manager Application

**Version 1.0.0**  
Technical Specification  
January 2026

> **Note:**  
> This document provides a comprehensive specification for building a secure,  
> user-friendly password management application. It covers architecture,  
> security protocols, features, UI/UX guidelines, and implementation details.

---

## Abstract

SecureVault is a modern, secure password management application built with Next.js. It provides users with a safe, encrypted vault to store, organize, and manage their passwords and sensitive credentials. The application emphasizes zero-knowledge architecture, end-to-end encryption, and an intuitive user interface that makes password management accessible to everyone.

---

## Table of Contents

- [SecureVault - Password Manager Application](#securevault---password-manager-application)
  - [Abstract](#abstract)
  - [Table of Contents](#table-of-contents)
  - [1. Core Principles](#1-core-principles)
    - [Architecture Overview](#architecture-overview)
  - [2. Authentication System](#2-authentication-system)
    - [2.1 User Registration](#21-user-registration)
    - [2.2 Login Flow](#22-login-flow)
    - [2.3 Multi-Factor Authentication](#23-multi-factor-authentication)
    - [2.4 Session Management](#24-session-management)
    - [2.5 Password Recovery](#25-password-recovery)
  - [3. Security Architecture](#3-security-architecture)
    - [3.1 Zero-Knowledge Design](#31-zero-knowledge-design)
    - [3.2 Encryption Standards](#32-encryption-standards)
    - [3.3 Key Derivation](#33-key-derivation)
    - [3.4 Data Protection](#34-data-protection)
    - [3.5 Security Headers](#35-security-headers)
  - [4. Account Management](#4-account-management)
    - [4.1 Profile Settings](#41-profile-settings)
    - [4.2 Security Settings](#42-security-settings)
    - [4.3 Account Recovery Options](#43-account-recovery-options)
    - [4.4 Account Deletion](#44-account-deletion)
    - [4.5 Data Export](#45-data-export)
  - [5. Password Vault](#5-password-vault)
    - [5.1 Adding Passwords](#51-adding-passwords)
    - [5.2 Viewing Passwords](#52-viewing-passwords)
    - [5.3 Editing Passwords](#53-editing-passwords)
    - [5.4 Deleting Passwords](#54-deleting-passwords)
    - [5.5 Password Organization](#55-password-organization)
    - [5.6 Search \& Filter](#56-search--filter)
  - [6. Password Generator](#6-password-generator)
    - [6.1 Generation Options](#61-generation-options)
    - [6.2 Strength Indicator](#62-strength-indicator)
    - [6.3 Custom Rules](#63-custom-rules)
  - [7. User Interface](#7-user-interface)
    - [7.1 Design System](#71-design-system)
    - [7.2 Password Card Layout](#72-password-card-layout)
    - [7.3 Dashboard Overview](#73-dashboard-overview)
    - [7.4 Responsive Design](#74-responsive-design)
    - [7.5 Accessibility](#75-accessibility)
  - [8. Data Models](#8-data-models)
    - [8.1 User Model](#81-user-model)
    - [8.2 Password Entry Model](#82-password-entry-model)
    - [8.3 Category Model](#83-category-model)
    - [8.4 Audit Log Model](#84-audit-log-model)
  - [9. API Endpoints](#9-api-endpoints)
    - [9.1 Authentication APIs](#91-authentication-apis)
    - [9.2 Password Management APIs](#92-password-management-apis)
    - [9.3 Account Management APIs](#93-account-management-apis)
  - [10. Security Best Practices](#10-security-best-practices)
    - [10.1 Input Validation](#101-input-validation)
    - [10.2 Rate Limiting](#102-rate-limiting)
    - [10.3 Audit Logging](#103-audit-logging)
    - [10.4 Secure Communication](#104-secure-communication)
  - [Appendix A: File Structure](#appendix-a-file-structure)
  - [Appendix B: Technology Stack](#appendix-b-technology-stack)
  - [Appendix C: Security Certifications \& Compliance](#appendix-c-security-certifications--compliance)

---

## 1. Core Principles

**Impact: FOUNDATIONAL**

The application is built on these fundamental principles:

| Principle | Description |
|-----------|-------------|
| **Zero-Knowledge** | The server never has access to unencrypted user data |
| **End-to-End Encryption** | All sensitive data is encrypted client-side before transmission |
| **User Privacy** | Minimal data collection, maximum user control |
| **Simplicity** | Complex security made simple through intuitive UX |
| **Transparency** | Open about security practices and data handling |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Master    │  │    Key      │  │    Encryption Layer     │  │
│  │  Password   │──│  Derivation │──│  (AES-256-GCM)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                           │                    │                 │
│                           ▼                    ▼                 │
│              ┌─────────────────────────────────────┐            │
│              │        Encrypted Vault Data          │            │
│              └─────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS/TLS 1.3
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER SIDE                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Next.js   │  │   Auth      │  │      PostgreSQL         │  │
│  │    API      │──│   Layer     │──│   (Encrypted Storage)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication System

**Impact: CRITICAL**

Authentication is the gateway to user security. Every component must be meticulously implemented.

### 2.1 User Registration

**Flow:**

1. User provides email and master password
2. Client validates password strength (minimum requirements)
3. Master password is used to derive encryption key (PBKDF2/Argon2id)
4. Authentication hash is derived separately from encryption key
5. Only the authentication hash is sent to server
6. Server stores salted hash of authentication hash

**Master Password Requirements:**

```typescript
interface PasswordRequirements {
  minLength: 12;              // Minimum 12 characters
  maxLength: 128;             // Maximum 128 characters
  requireUppercase: true;     // At least one uppercase letter
  requireLowercase: true;     // At least one lowercase letter
  requireNumbers: true;       // At least one number
  requireSpecialChars: true;  // At least one special character
  noCommonPasswords: true;    // Not in common password list
  noUserInfo: true;           // Cannot contain email or name
}
```

**Registration Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Email | string | Yes | Valid email format, unique |
| Master Password | string | Yes | Meets all requirements above |
| Confirm Password | string | Yes | Must match master password |
| Name | string | No | 2-100 characters |
| Accept Terms | boolean | Yes | Must be true |

### 2.2 Login Flow

**Standard Login Process:**

```
User Input → Client-Side Key Derivation → Auth Hash Generation → 
Server Verification → JWT Token Issued → Vault Decryption Key Available
```

**Login Security Measures:**

- Progressive delays after failed attempts (1s, 2s, 4s, 8s, 16s...)
- Account lockout after 10 failed attempts (30-minute cooldown)
- CAPTCHA after 3 failed attempts
- Notification email for suspicious login attempts
- Device fingerprinting for anomaly detection

### 2.3 Multi-Factor Authentication

**Supported MFA Methods:**

| Method | Security Level | Implementation |
|--------|----------------|----------------|
| TOTP (Authenticator App) | High | RFC 6238 compliant |
| Email OTP | Medium | 6-digit code, 10-min expiry |
| SMS OTP | Medium | 6-digit code, 5-min expiry |
| Hardware Keys (WebAuthn) | Highest | FIDO2/WebAuthn standard |
| Backup Codes | Emergency | 8 single-use codes |

**MFA Setup Flow:**

```typescript
interface MFASetup {
  // TOTP Setup
  totpSecret: string;          // Base32 encoded secret
  totpQRCode: string;          // QR code data URL
  backupCodes: string[];       // 8 recovery codes
  
  // Verification
  verificationCode: string;    // User must verify setup works
}
```

### 2.4 Session Management

**Session Configuration:**

```typescript
interface SessionConfig {
  accessTokenExpiry: '15m';           // Short-lived access token
  refreshTokenExpiry: '7d';           // Longer refresh token
  absoluteMaxSession: '30d';          // Maximum session duration
  inactivityTimeout: '15m';           // Auto-lock after inactivity
  maxConcurrentSessions: 5;           // Per user limit
  requireReauthForSensitive: true;    // Re-enter password for exports
}
```

**Session Security Features:**

- Secure, HttpOnly, SameSite cookies
- Token rotation on refresh
- Session invalidation on password change
- Geographic anomaly detection
- Device management dashboard

### 2.5 Password Recovery

**Recovery Options (No Master Password Access):**

Since we use zero-knowledge encryption, traditional password recovery is impossible. Instead:

1. **Recovery Key**: Generated at registration, user must store securely
2. **Trusted Contact Recovery**: Designated contact can initiate recovery
3. **Account Reset**: Complete vault wipe with identity verification

**Recovery Key Generation:**

```typescript
interface RecoveryKey {
  key: string;              // 256-bit random key, base64 encoded
  createdAt: Date;
  hasBeenViewed: boolean;   // User confirmed they saved it
  encryptedMasterKey: string; // Master key encrypted with recovery key
}
```

---

## 3. Security Architecture

**Impact: CRITICAL**

### 3.1 Zero-Knowledge Design

The server never receives or stores:
- Master password in any form
- Unencrypted vault data
- Encryption keys

**What the Server Stores:**

```typescript
interface ServerStoredData {
  userId: string;
  email: string;                    // For account identification
  emailHash: string;                // For login lookups
  authenticationHash: string;       // Derived from master password
  encryptedVault: string;           // Client-encrypted blob
  encryptedVaultKey: string;        // Key encrypted with auth key
  salt: string;                     // For key derivation
  mfaSecret?: string;               // Encrypted TOTP secret
  settings: EncryptedSettings;      // Non-sensitive settings
}
```

### 3.2 Encryption Standards

**Primary Encryption: AES-256-GCM**

```typescript
interface EncryptionConfig {
  algorithm: 'AES-256-GCM';
  keyLength: 256;
  ivLength: 96;                     // 12 bytes
  tagLength: 128;                   // 16 bytes authentication tag
  encoding: 'base64';
}
```

**Encryption Process:**

```typescript
async function encryptData(plaintext: string, key: CryptoKey): Promise<EncryptedData> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(plaintext);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );
  
  return {
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(ciphertext),
    version: 1
  };
}
```

### 3.3 Key Derivation

**Using Argon2id (Preferred) or PBKDF2 (Fallback):**

```typescript
interface KeyDerivationConfig {
  // Argon2id parameters (preferred)
  argon2: {
    memory: 65536;          // 64 MB
    iterations: 3;
    parallelism: 4;
    hashLength: 32;         // 256 bits
  };
  
  // PBKDF2 fallback (Web Crypto API)
  pbkdf2: {
    iterations: 600000;     // OWASP 2023 recommendation
    hash: 'SHA-256';
    keyLength: 256;
  };
}
```

**Key Hierarchy:**

```
Master Password
      │
      ├──► Authentication Key (for login)
      │         │
      │         └──► Authentication Hash (sent to server)
      │
      └──► Encryption Key (for vault)
                │
                └──► Vault Encryption (local only)
```

### 3.4 Data Protection

**Data at Rest:**
- All vault data encrypted with user's encryption key
- Server database uses additional encryption layer
- Backups are encrypted with separate key

**Data in Transit:**
- TLS 1.3 required for all connections
- Certificate pinning for mobile apps
- HSTS with long max-age

### 3.5 Security Headers

```typescript
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://api.securevault.app;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
```

---

## 4. Account Management

**Impact: HIGH**

### 4.1 Profile Settings

**Editable Profile Fields:**

| Field | Type | Description |
|-------|------|-------------|
| Display Name | string | User's preferred name |
| Email | string | Primary email (requires verification) |
| Avatar | file | Profile picture upload |
| Language | select | UI language preference |
| Timezone | select | For activity timestamps |

### 4.2 Security Settings

**Configurable Security Options:**

```typescript
interface SecuritySettings {
  // Session Settings
  autoLockTimeout: 1 | 5 | 15 | 30 | 60;    // Minutes
  lockOnBrowserClose: boolean;
  clearClipboardAfter: 30 | 60 | 90 | 120;   // Seconds
  
  // Authentication Settings
  mfaEnabled: boolean;
  mfaMethods: ('totp' | 'email' | 'sms' | 'webauthn')[];
  trustedDevices: TrustedDevice[];
  
  // Notification Settings
  notifyOnNewLogin: boolean;
  notifyOnPasswordChange: boolean;
  notifyOnExport: boolean;
  
  // Advanced
  passwordIterations: number;              // Increase for more security
  sessionConcurrencyLimit: number;
}
```

### 4.3 Account Recovery Options

**Recovery Configuration:**

```typescript
interface RecoveryOptions {
  recoveryKey: {
    isSet: boolean;
    lastViewed: Date | null;
    canRegenerate: boolean;
  };
  
  trustedContacts: {
    email: string;
    name: string;
    addedAt: Date;
    canInitiateRecovery: boolean;
  }[];
  
  securityQuestions: {
    question: string;
    answerHash: string;          // Hashed answer
  }[];                           // Optional, not recommended
}
```

### 4.4 Account Deletion

**Deletion Process:**

1. User requests deletion
2. Re-authentication required (password + MFA)
3. 7-day grace period with daily email reminders
4. Option to export data before deletion
5. Permanent deletion of all user data
6. Confirmation email sent

**Deletion Checklist:**

- [ ] All vault entries permanently deleted
- [ ] All encryption keys destroyed
- [ ] All session tokens invalidated
- [ ] All backup data purged
- [ ] Audit logs anonymized (retained for security)
- [ ] Email removed from all lists

### 4.5 Data Export

**Export Formats:**

| Format | Description | Encrypted |
|--------|-------------|-----------|
| JSON | Full vault export | Optional |
| CSV | Spreadsheet compatible | No |
| Encrypted Backup | SecureVault format | Yes |
| 1Password | Compatible format | No |
| LastPass | Compatible format | No |
| Bitwarden | Compatible format | No |

**Export Security:**

```typescript
interface ExportConfig {
  requireReauth: true;                  // Must re-enter master password
  requireMFA: true;                     // Must complete MFA
  rateLimited: '3 per day';            // Limit export frequency
  notifyUser: true;                    // Email notification on export
  includeDeleted: false;               // Option to include trash
  passwordProtect: boolean;            // Additional password for file
}
```

---

## 5. Password Vault

**Impact: CRITICAL**

### 5.1 Adding Passwords

**Password Entry Form:**

```typescript
interface PasswordEntry {
  // Required Fields
  id: string;                          // UUID v4
  name: string;                        // Entry title (e.g., "Gmail")
  
  // Credential Fields
  username?: string;                   // Username or email
  password: string;                    // The password
  
  // URL Fields
  urls: string[];                      // Associated URLs
  
  // Organization
  categoryId?: string;                 // Category/folder
  tags: string[];                      // Custom tags
  favorite: boolean;                   // Quick access
  
  // Additional Fields
  notes?: string;                      // Encrypted notes
  customFields: CustomField[];         // Custom key-value pairs
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  passwordChangedAt: Date;
  
  // Security
  passwordStrength: PasswordStrength;
  isCompromised: boolean;              // Checked against breach databases
  isReused: boolean;                   // Used elsewhere in vault
  isWeak: boolean;                     // Fails strength check
}

interface CustomField {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'hidden' | 'url' | 'email' | 'phone';
}
```

**Add Password Modal:**

```
┌─────────────────────────────────────────────────────────────┐
│  ✕  Add New Password                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Name *                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ e.g., Gmail, Netflix, Bank Account                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Username / Email                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ john.doe@example.com                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Password *                              [🎲] [👁]           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ••••••••••••••••                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ████████████████████░░░░ Strong                            │
│                                                             │
│  Website URL                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ https://gmail.com                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  [+ Add another URL]                                        │
│                                                             │
│  Category                              Tags                 │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │ 📧 Email         ▼   │  │ work, important          │   │
│  └──────────────────────┘  └──────────────────────────┘   │
│                                                             │
│  ▼ Advanced Options                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Notes                                                │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  [+ Add Custom Field]                                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                               [Cancel]  [Save Password]     │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Viewing Passwords

**Password Card Display:**

```
┌─────────────────────────────────────────────────────────────┐
│  🟢 Gmail                                           ⭐ ⋮    │
│  ─────────────────────────────────────────────────────────  │
│  📧 john.doe@gmail.com                            [Copy]    │
│  🔑 ••••••••••••••                         [Copy] [Show]    │
│  🔗 https://gmail.com                      [Copy] [Open]    │
│  ─────────────────────────────────────────────────────────  │
│  📁 Email  •  🏷️ work, personal  •  Updated 2 days ago     │
└─────────────────────────────────────────────────────────────┘
```

**Card Status Indicators:**

| Icon | Color | Meaning |
|------|-------|---------|
| 🟢 | Green | Password is strong and secure |
| 🟡 | Yellow | Password could be improved |
| 🔴 | Red | Password is weak or compromised |
| ⚠️ | Orange | Password is reused elsewhere |
| ⭐ | Gold | Marked as favorite |

**Password Visibility:**
- Default: Hidden (dots)
- Click to reveal for 30 seconds
- Auto-hide on blur or timeout
- Clipboard auto-clear after copy

### 5.3 Editing Passwords

**Edit Mode Features:**

```typescript
interface EditFeatures {
  inlineEditing: boolean;              // Edit fields directly in view
  fullEditModal: boolean;              // Open full edit form
  passwordHistory: PasswordVersion[];  // Previous passwords
  undoChanges: boolean;                // Revert to previous version
  lastModifiedBy: string;              // For shared vaults
}

interface PasswordVersion {
  id: string;
  password: string;                    // Encrypted
  changedAt: Date;
  changedBy: string;
}
```

**Password History:**

```
Password History (Last 10)
───────────────────────────────────────
🔐 ••••••••••••        Jan 19, 2026   [Use This]
🔐 ••••••••••••        Dec 15, 2025   [Use This]
🔐 ••••••••••••        Nov 01, 2025   [Use This]
───────────────────────────────────────
```

### 5.4 Deleting Passwords

**Deletion Flow:**

1. User clicks delete
2. Confirmation dialog appears
3. Entry moved to Trash
4. 30-day retention in Trash
5. Permanent deletion after 30 days
6. Option to restore from Trash

**Deletion Confirmation:**

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Delete "Gmail"?                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This password will be moved to Trash and permanently       │
│  deleted after 30 days.                                     │
│                                                             │
│  You can restore it from Trash at any time before then.     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        [Cancel]  [🗑️ Move to Trash]         │
└─────────────────────────────────────────────────────────────┘
```

**Bulk Actions:**

- Select multiple passwords
- Bulk move to category
- Bulk delete
- Bulk export
- Bulk tag management

### 5.5 Password Organization

**Categories (Folders):**

```typescript
interface Category {
  id: string;
  name: string;
  icon: string;                        // Emoji or icon name
  color: string;                       // Hex color
  parentId?: string;                   // For nested categories
  order: number;                       // Sort order
  passwordCount: number;               // Computed
}
```

**Default Categories:**

| Icon | Name | Description |
|------|------|-------------|
| 🔐 | All Items | All passwords |
| ⭐ | Favorites | Starred items |
| 💳 | Finance | Banks, payments |
| 📧 | Email | Email accounts |
| 💼 | Work | Work-related |
| 🎮 | Entertainment | Streaming, gaming |
| 🛒 | Shopping | E-commerce sites |
| 🌐 | Social | Social media |
| 🗑️ | Trash | Deleted items |

**Tag System:**

```typescript
interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
}

// Tags can be created on-the-fly during password creation
// Autocomplete suggests existing tags
// Unused tags are automatically cleaned up
```

### 5.6 Search & Filter

**Search Capabilities:**

```typescript
interface SearchOptions {
  query: string;                       // Full-text search
  
  // Search in fields
  searchIn: {
    name: boolean;
    username: boolean;
    urls: boolean;
    notes: boolean;
    tags: boolean;
    customFields: boolean;
  };
  
  // Filters
  filters: {
    categories: string[];
    tags: string[];
    favorite: boolean | null;
    hasNotes: boolean | null;
    createdAfter: Date | null;
    createdBefore: Date | null;
    lastUsedAfter: Date | null;
    
    // Security filters
    isWeak: boolean | null;
    isReused: boolean | null;
    isCompromised: boolean | null;
    isOld: boolean | null;             // Not changed in 90+ days
  };
  
  // Sorting
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'lastUsedAt';
  sortOrder: 'asc' | 'desc';
}
```

**Search UI:**

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Search passwords...                              ⚙️     │
└─────────────────────────────────────────────────────────────┘

Filters:
[All Categories ▼] [All Tags ▼] [⭐ Favorites] [⚠️ Issues]

Sort by: [Name ▼] [↑ Ascending]
```

---

## 6. Password Generator

**Impact: HIGH**

### 6.1 Generation Options

**Generator Configuration:**

```typescript
interface GeneratorOptions {
  // Length
  length: number;                      // 8-128 characters
  
  // Character Sets
  uppercase: boolean;                  // A-Z
  lowercase: boolean;                  // a-z
  numbers: boolean;                    // 0-9
  symbols: boolean;                    // !@#$%^&*()_+-=[]{}|;':\",./<>?
  
  // Advanced
  excludeAmbiguous: boolean;           // Exclude 0, O, l, 1, I
  excludeCharacters: string;           // Custom exclusions
  requireEachType: boolean;            // Ensure at least one of each
  
  // Memorable Passwords
  useWords: boolean;                   // Word-based generation
  wordCount: number;                   // Number of words
  wordSeparator: string;               // Separator character
  capitalizeWords: boolean;            // Capitalize each word
  includeNumber: boolean;              // Add number to memorable
}
```

**Generator UI:**

```
┌─────────────────────────────────────────────────────────────┐
│  🎲 Password Generator                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ K#9xMp$2vL@nQ8wR                            [🔄] [📋] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ████████████████████████████ Very Strong (128 bits)        │
│                                                             │
│  Length: 16                                                 │
│  ├────────────────────●─────────────────────┤              │
│  8                                        128               │
│                                                             │
│  Character Types:                                           │
│  ☑️ Uppercase (A-Z)        ☑️ Numbers (0-9)                 │
│  ☑️ Lowercase (a-z)        ☑️ Symbols (!@#$%)               │
│                                                             │
│  ▼ Advanced Options                                         │
│  ☐ Exclude ambiguous characters (0, O, l, 1)               │
│  ☐ Require at least one of each type                       │
│                                                             │
│  ─────────────────── OR ────────────────────                │
│                                                             │
│  ○ Memorable Password                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ correct-horse-battery-staple                         │   │
│  └─────────────────────────────────────────────────────┘   │
│  Words: 4    Separator: [-]    ☑️ Capitalize               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                          [Cancel]  [Use Password]           │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Strength Indicator

**Strength Calculation:**

```typescript
interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;           // 0=Very Weak, 4=Very Strong
  entropy: number;                     // Bits of entropy
  crackTime: string;                   // Estimated crack time
  feedback: string[];                  // Improvement suggestions
  warning?: string;                    // Specific warning
}

function calculateStrength(password: string): PasswordStrength {
  // Factors considered:
  // - Length
  // - Character variety
  // - Common patterns
  // - Dictionary words
  // - Keyboard patterns (qwerty)
  // - Repeated characters
  // - Sequential characters
  // - Known breach databases
}
```

**Strength Display:**

| Score | Label | Color | Min Entropy |
|-------|-------|-------|-------------|
| 0 | Very Weak | Red | 0-25 bits |
| 1 | Weak | Orange | 26-50 bits |
| 2 | Fair | Yellow | 51-75 bits |
| 3 | Strong | Light Green | 76-100 bits |
| 4 | Very Strong | Green | 100+ bits |

### 6.3 Custom Rules

**Site-Specific Rules:**

```typescript
interface SitePasswordRules {
  sitePattern: string;                 // URL pattern
  minLength: number;
  maxLength: number;
  allowedCharacters: string;
  forbiddenCharacters: string;
  requiredPatterns: string[];          // e.g., ["[A-Z]", "[0-9]"]
  forbiddenPatterns: string[];         // e.g., sequences
}

// Pre-configured rules for common sites
const commonRules: SitePasswordRules[] = [
  {
    sitePattern: "*.bankofamerica.com",
    minLength: 8,
    maxLength: 20,
    allowedCharacters: "a-zA-Z0-9@#$%",
    // ... etc
  }
];
```

---

## 7. User Interface

**Impact: HIGH**

### 7.1 Design System

**Color Palette:**

```typescript
const colors = {
  // Primary
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    500: '#4CAF50',                    // Main brand color
    600: '#43A047',
    700: '#388E3C',
    900: '#1B5E20',
  },
  
  // Neutral
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Semantic
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Dark Mode
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    elevated: '#2D2D2D',
  }
};
```

**Typography:**

```typescript
const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace',
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
};
```

**Spacing System:**

```typescript
const spacing = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
};
```

### 7.2 Password Card Layout

**Card Variants:**

**Compact View (List):**
```
┌────────────────────────────────────────────────────────────┐
│ 🟢 Gmail          john.doe@gmail.com        [📋] [⋮]       │
└────────────────────────────────────────────────────────────┘
```

**Standard View (Grid):**
```
┌─────────────────────────────┐
│  🟢 Gmail             ⭐ ⋮  │
│  ─────────────────────────  │
│  📧 john.doe@gmail.com      │
│  🔗 gmail.com               │
│  ─────────────────────────  │
│  📁 Email  •  2 days ago    │
└─────────────────────────────┘
```

**Expanded View (Detail):**
```
┌─────────────────────────────────────────────────────────────┐
│  🟢 Gmail                                           ⭐ ⋮    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Username                                                   │
│  john.doe@gmail.com                                 [📋]    │
│                                                             │
│  Password                                                   │
│  ••••••••••••••••                          [📋] [👁] [🔄]   │
│  ████████████████████ Strong                                │
│                                                             │
│  Website                                                    │
│  https://gmail.com                         [📋] [↗]        │
│  https://mail.google.com                   [📋] [↗]        │
│                                                             │
│  Notes                                                      │
│  Recovery email: backup@email.com                           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Created: Jan 1, 2025  •  Modified: Jan 19, 2026           │
│  Last used: Today at 2:30 PM                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [🗑️ Delete]              [✏️ Edit]  [📤 Share]             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Dashboard Overview

**Main Dashboard Layout:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SecureVault                              🔔  👤 John Doe  ▼           │
├─────────────────┬───────────────────────────────────────────────────────┤
│                 │                                                       │
│  🔐 All Items   │  🔍 Search passwords...                    [+ Add]   │
│     (247)       │  ─────────────────────────────────────────────────── │
│                 │                                                       │
│  ⭐ Favorites   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│     (12)        │  │ 🟢 Gmail    │ │ 🟢 GitHub   │ │ 🟡 Twitter  │    │
│                 │  │ john@...    │ │ johndoe     │ │ @johndoe    │    │
│  ─────────────  │  │ 📧 Email    │ │ 💼 Work     │ │ 🌐 Social   │    │
│                 │  └─────────────┘ └─────────────┘ └─────────────┘    │
│  📁 Categories  │                                                       │
│                 │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  💳 Finance (8) │  │ 🟢 Netflix  │ │ 🔴 LinkedIn │ │ 🟢 Amazon   │    │
│  📧 Email (15)  │  │ john@...    │ │ john.doe    │ │ john@...    │    │
│  💼 Work (42)   │  │ 🎮 Enter... │ │ 💼 Work     │ │ 🛒 Shopping │    │
│  🎮 Entertain.  │  └─────────────┘ └─────────────┘ └─────────────┘    │
│     (23)        │                                                       │
│  🛒 Shopping    │  ─────────────────────────────────────────────────── │
│     (31)        │                                                       │
│  🌐 Social (28) │  Security Overview                                    │
│                 │  ┌───────────────────────────────────────────────┐   │
│  ─────────────  │  │  ⚠️ 3 Weak  │  🔄 7 Reused  │  🔴 1 Breach  │   │
│                 │  └───────────────────────────────────────────────┘   │
│  🏷️ Tags        │                                                       │
│  work (42)      │                                                       │
│  personal (85)  │                                                       │
│  important (23) │                                                       │
│                 │                                                       │
│  ─────────────  │                                                       │
│                 │                                                       │
│  🗑️ Trash (5)   │                                                       │
│                 │                                                       │
├─────────────────┴───────────────────────────────────────────────────────┤
│  🔒 Vault locked in 14:32  •  Last sync: Just now  •  v1.0.0          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.4 Responsive Design

**Breakpoints:**

```typescript
const breakpoints = {
  sm: '640px',     // Mobile landscape
  md: '768px',     // Tablet
  lg: '1024px',    // Desktop
  xl: '1280px',    // Large desktop
  '2xl': '1536px', // Extra large
};
```

**Mobile Layout:**

```
┌─────────────────────────────────┐
│  ☰  SecureVault        🔔 👤   │
├─────────────────────────────────┤
│  🔍 Search...          [+ Add] │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐ │
│  │ 🟢 Gmail            ⭐ ⋮  │ │
│  │ john.doe@gmail.com        │ │
│  │ 📧 Email • 2 days ago     │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 🟢 GitHub           ⋮     │ │
│  │ johndoe                   │ │
│  │ 💼 Work • 1 week ago      │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 🟡 Twitter          ⋮     │ │
│  │ @johndoe                  │ │
│  │ 🌐 Social • 3 weeks ago   │ │
│  └───────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│  🏠    📁    ➕    🔒    ⚙️    │
└─────────────────────────────────┘
```

### 7.5 Accessibility

**WCAG 2.1 AA Compliance:**

```typescript
interface AccessibilityFeatures {
  // Visual
  colorContrastRatio: '4.5:1';           // Minimum for text
  focusIndicators: 'visible-ring';       // Clear focus states
  textScaling: 'up-to-200%';             // Support text zoom
  
  // Motor
  minTouchTarget: '44x44px';             // Minimum tap size
  keyboardNavigation: 'full';            // All features accessible
  noTimeouts: true;                      // User-controlled timeouts
  
  // Cognitive
  clearLabels: true;                     // Descriptive labels
  errorMessages: 'specific';             // Clear error descriptions
  confirmDialogs: true;                  // Confirm destructive actions
  
  // Screen Readers
  ariaLabels: 'comprehensive';
  liveRegions: true;                     // Announce changes
  semanticHTML: true;                    // Proper heading structure
}
```

**Keyboard Shortcuts:**

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New password |
| `Ctrl/Cmd + F` | Focus search |
| `Ctrl/Cmd + L` | Lock vault |
| `Ctrl/Cmd + G` | Open generator |
| `Ctrl/Cmd + ,` | Settings |
| `Esc` | Close modal / Clear search |
| `Enter` | Open selected item |
| `Delete` | Delete selected item |
| `↑ / ↓` | Navigate list |

---

## 8. Data Models

**Impact: HIGH**

### 8.1 User Model

```typescript
interface User {
  // Identity
  id: string;                          // UUID v4
  email: string;                       // Primary identifier
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  
  // Profile
  name?: string;
  avatarUrl?: string;
  
  // Authentication
  authHash: string;                    // Derived from master password
  authSalt: string;                    // For key derivation
  
  // Encryption
  encryptedVaultKey: string;           // Vault key encrypted with auth key
  publicKey?: string;                  // For sharing (future)
  
  // MFA
  mfaEnabled: boolean;
  mfaSecret?: string;                  // Encrypted TOTP secret
  mfaBackupCodes?: string[];           // Encrypted backup codes
  
  // Recovery
  recoveryKeyHash?: string;            // Hash of recovery key
  encryptedRecoveryData?: string;      // Master key encrypted with recovery key
  
  // Settings
  settings: UserSettings;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  
  // Status
  status: 'active' | 'suspended' | 'deleted';
  deletionRequestedAt?: Date;
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
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
  defaultView: 'grid' | 'list';
  defaultSort: 'name' | 'updated' | 'created';
  showFavicons: boolean;
}
```

### 8.2 Password Entry Model

```typescript
interface PasswordEntry {
  // Identity
  id: string;                          // UUID v4
  userId: string;                      // Owner
  
  // Core Fields (All Encrypted)
  name: string;
  username?: string;
  password: string;
  urls: string[];
  notes?: string;
  
  // Custom Fields
  customFields: {
    id: string;
    name: string;
    value: string;
    type: 'text' | 'hidden' | 'url' | 'email' | 'phone' | 'date';
  }[];
  
  // Organization
  categoryId?: string;
  tags: string[];
  favorite: boolean;
  
  // Security Analysis
  passwordStrength: 0 | 1 | 2 | 3 | 4;
  passwordEntropy: number;
  isCompromised: boolean;
  isReused: boolean;
  
  // History
  passwordHistory: {
    id: string;
    password: string;                  // Encrypted
    changedAt: Date;
  }[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  passwordChangedAt: Date;
  
  // Soft Delete
  deletedAt?: Date;
  
  // Encryption Metadata
  encryptionVersion: number;
  iv: string;
}
```

### 8.3 Category Model

```typescript
interface Category {
  id: string;
  userId: string;
  
  name: string;
  icon: string;
  color: string;
  
  parentId?: string;                   // For nesting
  order: number;
  
  isDefault: boolean;                  // System category
  isLocked: boolean;                   // Cannot delete
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 8.4 Audit Log Model

```typescript
interface AuditLog {
  id: string;
  userId: string;
  
  // Action Details
  action: AuditAction;
  resourceType: 'password' | 'category' | 'user' | 'session';
  resourceId?: string;
  
  // Context
  ipAddress: string;
  userAgent: string;
  geoLocation?: {
    country: string;
    city: string;
  };
  
  // Details
  metadata: Record<string, unknown>;
  
  // Timestamp
  createdAt: Date;
}

type AuditAction = 
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'password_created'
  | 'password_updated'
  | 'password_deleted'
  | 'password_viewed'
  | 'password_copied'
  | 'export_requested'
  | 'settings_changed'
  | 'recovery_key_viewed'
  | 'session_revoked';
```

---

## 9. API Endpoints

**Impact: HIGH**

### 9.1 Authentication APIs

```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  authHash: string;                    // Client-derived hash
  salt: string;
  encryptedVaultKey: string;
  name?: string;
}
interface RegisterResponse {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  authHash: string;
}
interface LoginResponse {
  requiresMfa: boolean;
  mfaToken?: string;                   // Temporary token for MFA step
  user?: UserPublic;
  accessToken?: string;
  refreshToken?: string;
  encryptedVaultKey?: string;
  salt?: string;
}

// POST /api/auth/mfa/verify
interface MfaVerifyRequest {
  mfaToken: string;
  code: string;
  method: 'totp' | 'email' | 'sms' | 'backup';
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// POST /api/auth/logout
// (Invalidates all tokens for session)

// POST /api/auth/logout-all
// (Invalidates all sessions for user)
```

### 9.2 Password Management APIs

```typescript
// GET /api/vault
// Returns entire encrypted vault
interface VaultResponse {
  passwords: EncryptedPasswordEntry[];
  categories: Category[];
  tags: string[];
  lastModified: Date;
  version: number;
}

// POST /api/vault/passwords
interface CreatePasswordRequest {
  encryptedData: string;               // Client-encrypted entry
  metadata: {
    categoryId?: string;
    tags: string[];
    favorite: boolean;
  };
}

// PUT /api/vault/passwords/:id
interface UpdatePasswordRequest {
  encryptedData: string;
  metadata: {
    categoryId?: string;
    tags: string[];
    favorite: boolean;
  };
}

// DELETE /api/vault/passwords/:id
// Soft delete (move to trash)

// DELETE /api/vault/passwords/:id/permanent
// Permanent delete

// POST /api/vault/passwords/:id/restore
// Restore from trash

// GET /api/vault/sync
// Returns changes since last sync
interface SyncRequest {
  lastSyncedAt: Date;
  clientVersion: number;
}
interface SyncResponse {
  changes: VaultChange[];
  serverVersion: number;
  conflicts: VaultConflict[];
}
```

### 9.3 Account Management APIs

```typescript
// GET /api/user/profile
// PUT /api/user/profile

// PUT /api/user/email
interface ChangeEmailRequest {
  newEmail: string;
  authHash: string;                    // Current password verification
}

// PUT /api/user/password
interface ChangePasswordRequest {
  currentAuthHash: string;
  newAuthHash: string;
  newSalt: string;
  reEncryptedVaultKey: string;         // Vault key re-encrypted with new auth
  reEncryptedRecoveryData?: string;
}

// POST /api/user/mfa/setup
// POST /api/user/mfa/enable
// DELETE /api/user/mfa

// GET /api/user/sessions
// DELETE /api/user/sessions/:id

// GET /api/user/audit-log

// POST /api/user/export
interface ExportRequest {
  format: 'json' | 'csv' | 'encrypted';
  password?: string;                   // Additional encryption
  authHash: string;                    // Verification
}

// DELETE /api/user/account
interface DeleteAccountRequest {
  authHash: string;
  mfaCode?: string;
  confirmation: 'DELETE';
}
```

---

## 10. Security Best Practices

**Impact: CRITICAL**

### 10.1 Input Validation

**Validation Rules:**

```typescript
import { z } from 'zod';

const emailSchema = z.string()
  .email()
  .max(254)
  .transform(e => e.toLowerCase().trim());

const passwordEntryNameSchema = z.string()
  .min(1)
  .max(200)
  .trim();

const urlSchema = z.string()
  .url()
  .max(2048)
  .refine(url => {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  });

const masterPasswordSchema = z.string()
  .min(12)
  .max(128)
  .refine(password => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    return hasUpper && hasLower && hasNumber && hasSpecial;
  }, {
    message: 'Password must contain uppercase, lowercase, number, and special character'
  });
```

**Sanitization:**

- All user input sanitized before storage
- HTML entities escaped in display
- SQL injection prevented via parameterized queries
- XSS prevention through Content Security Policy

### 10.2 Rate Limiting

**Rate Limit Configuration:**

```typescript
interface RateLimits {
  // Authentication
  login: {
    window: '15m',
    max: 10,
    blockDuration: '30m',
  };
  
  register: {
    window: '1h',
    max: 5,
    blockDuration: '24h',
  };
  
  mfaVerify: {
    window: '5m',
    max: 5,
    blockDuration: '30m',
  };
  
  passwordReset: {
    window: '1h',
    max: 3,
    blockDuration: '24h',
  };
  
  // API
  general: {
    window: '1m',
    max: 100,
  };
  
  export: {
    window: '24h',
    max: 3,
  };
  
  // Breach Checking
  breachCheck: {
    window: '1m',
    max: 30,
  };
}
```

### 10.3 Audit Logging

**Logged Events:**

| Category | Events |
|----------|--------|
| Authentication | Login, Logout, Failed login, MFA changes |
| Vault Access | View, Copy, Create, Update, Delete |
| Account | Settings change, Email change, Password change |
| Security | Export, Session management, Recovery |
| Admin | Suspicious activity, Rate limit violations |

**Log Retention:**

- Security logs: 2 years
- Access logs: 90 days
- Anonymized analytics: Indefinite

### 10.4 Secure Communication

**TLS Configuration:**

```typescript
const tlsConfig = {
  minVersion: 'TLSv1.3',
  cipherSuites: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
  ],
  
  // HSTS
  hsts: {
    maxAge: 31536000,                  // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // Certificate
  certificateTransparency: true,
  ocspStapling: true,
};
```

**API Security:**

```typescript
const apiSecurityConfig = {
  // Request validation
  maxRequestSize: '1mb',
  requestTimeout: '30s',
  
  // Response security
  noSniff: true,
  frameOptions: 'DENY',
  xssProtection: true,
  
  // CORS
  cors: {
    origin: ['https://app.securevault.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    maxAge: 86400,
  },
};
```

---

## Appendix A: File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   ├── (dashboard)/
│   │   ├── vault/
│   │   ├── categories/
│   │   ├── generator/
│   │   ├── settings/
│   │   └── security/
│   ├── api/
│   │   ├── auth/
│   │   ├── vault/
│   │   └── user/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── vault/
│   ├── ui/
│   └── shared/
├── lib/
│   ├── crypto/
│   ├── api/
│   ├── hooks/
│   └── utils/
├── stores/
├── types/
└── styles/
```

---

## Appendix B: Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, Radix UI |
| State | Zustand, React Query |
| Forms | React Hook Form, Zod |
| Encryption | Web Crypto API, libsodium.js |
| Backend | Next.js API Routes |
| Database | PostgreSQL, Prisma ORM |
| Auth | Custom JWT, NextAuth.js (optional) |
| Hosting | Vercel |
| Monitoring | Vercel Analytics, Sentry |

---

## Appendix C: Security Certifications & Compliance

**Target Compliance:**

- SOC 2 Type II
- GDPR
- CCPA
- ISO 27001

**Security Audits:**

- Annual third-party penetration testing
- Continuous automated vulnerability scanning
- Bug bounty program

---

*Document Version: 1.0.0*  
*Last Updated: January 19, 2026*  
*Next Review: April 19, 2026*
