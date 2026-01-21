# Password Display Bug - Root Cause Analysis and Fix

## Problem
Passwords were not showing up in the vault even though the API endpoint confirmed 5-6 passwords existed in the database. Users saw "No passwords yet" message instead.

## Root Cause
**Salt Mismatch During Key Derivation**

The encryption/decryption keys were being derived inconsistently:

### During Registration (`useAuthFlow.ts`):
1. Generated a **random 32-byte salt** 
2. Stored this salt in `user.authSalt` field in the database
3. Used this random salt to derive the encryption key
4. Encrypted passwords with this key

### During Login (`login/page.tsx`):
1. Used the **user's email as the salt** ❌
2. Derived encryption key using email as salt
3. Attempted to decrypt passwords with wrong key → **OperationError**

```typescript
// WRONG: Using email as salt
const { authHash, encryptionKey } = await deriveKeys(password, email);
```

Since the salt was different, the derived encryption key was different, causing all decryption attempts to fail with `OperationError`.

## Solution

### 1. Created Salt Retrieval Endpoint
**File**: `src/app/api/auth/salt/route.ts`
- New endpoint to fetch user's stored salt before login
- Prevents user enumeration by returning deterministic fake salt for non-existent users
- Only works for credentials auth users (OAuth users don't have salts)

### 2. Updated Login Flow
**File**: `src/app/(auth)/login/page.tsx`

Changed the login process to:
1. **Fetch the user's salt** from `/api/auth/salt` 
2. **Derive keys using the correct salt** from database
3. **Authenticate** with NextAuth using derived authHash
4. **Store encryption key** for vault decryption

```typescript
// CORRECT: Fetch salt first, then derive keys
const saltResponse = await fetch("/api/auth/salt", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email }),
});
const { data: saltData } = await saltResponse.json();
const salt = saltData.salt;

// Now derive keys with the correct salt
const { authHash, encryptionKey } = await deriveKeys(password, salt);
```

## Why This Matters

In a zero-knowledge password manager:
- The master password never leaves the device
- All encryption keys are derived client-side using PBKDF2
- The salt must be consistent between registration and login
- **Without the correct salt, decryption is impossible**

## Testing Required

1. **Existing Users**: Need to test if existing passwords can now be decrypted
2. **New Registrations**: Verify new users can access their passwords after registration
3. **Password Rotation**: May need to re-encrypt existing passwords if they were encrypted with wrong keys

## Additional Findings

- Console logging was added temporarily for debugging (now removed)
- The vault layout properly restores encryption key from sessionStorage
- React Query is properly configured with correct enable conditions
- Error handling for failed decryptions is in place

## Files Modified

1. ✅ `src/app/api/auth/salt/route.ts` - New endpoint
2. ✅ `src/app/(auth)/login/page.tsx` - Fixed login flow
3. ✅ `src/app/(dashboard)/vault/layout.tsx` - Cleaned up debug logs
4. ✅ `src/hooks/usePasswordsQuery.ts` - Cleaned up debug logs
