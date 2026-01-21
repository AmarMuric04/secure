# Password Decryption Error - Complete Analysis & Solution

## Current Status
❌ **All passwords fail to decrypt with `OperationError`**

## Root Cause
Your passwords were encrypted with a **different encryption key** than the one being used to decrypt them.

### What Happened:

1. **OLD (Broken) Login Flow:**
   - Used **email** as the salt when deriving encryption keys
   - Code: `deriveKeys(password, email)` ❌
   - This created a predictable, insecure key

2. **NEW (Fixed) Login Flow:**
   - Fetches the user's **stored salt** from database
   - Code: `deriveKeys(password, user.authSalt)` ✅
   - Uses the correct random salt from registration

3. **The Problem:**
   - Any passwords created with the OLD flow were encrypted with key derived from `email`
   - Now you're trying to decrypt them with key derived from `authSalt`
   - These are two completely different keys → **decryption fails**

### Why This is Unfixable (Without the Old Key):
In AES-GCM encryption, if you don't have the exact key that was used to encrypt, decryption is cryptographically impossible. It's not a bug - it's security working as designed.

## Solutions

### ✅ Option 1: Start Fresh (RECOMMENDED)

Delete all existing passwords and create new ones:

\`\`\`bash
# Check your user's salt status
node scripts/check-user-salt.js your-email@example.com

# Delete all existing passwords
node scripts/delete-all-passwords.js your-email@example.com

# Then log in and create new passwords - they will work correctly!
\`\`\`

### Option 2: Migration (If You Have Data to Preserve)

If you have important passwords, you'll need to:

1. **Log in with the OLD broken flow** to decrypt them
2. **Re-encrypt with the NEW correct flow**
3. **Update the database**

This is complex and requires temporarily reverting the code. Not recommended unless absolutely necessary.

## Testing the Fix

After deleting old passwords:

1. **Clear browser storage:**
   \`\`\`javascript
   // In browser console
   sessionStorage.clear();
   localStorage.clear();
   \`\`\`

2. **Log out completely**

3. **Log back in** - Check console logs for:
   \`\`\`
   [Login] Retrieved salt: abc123...
   [Login] Derived keys using salt
   \`\`\`

4. **Create a new password** in the vault

5. **Refresh the page** - the password should decrypt successfully

## How to Verify It's Working

You should see in the console:
\`\`\`
[usePasswordsQuery] Fetching vault data
[usePasswordsQuery] Decryption complete: { successful: X, failed: 0 }
\`\`\`

If you see:
\`\`\`
[usePasswordsQuery] CRITICAL: All X passwords failed to decrypt!
\`\`\`

Then the passwords are still encrypted with the wrong key and need to be deleted.

## Prevention

The fix ensures this won't happen again:

1. ✅ **Salt Retrieval Endpoint** (`/api/auth/salt`) - fetches correct salt before login
2. ✅ **Updated Login Flow** - uses retrieved salt to derive keys
3. ✅ **Registration** - already correctly saves random salt
4. ✅ **Error Logging** - warns when decryption fails

## Quick Commands

\`\`\`bash
# Diagnose the issue
node scripts/check-user-salt.js your-email@example.com

# Delete problematic passwords
node scripts/delete-all-passwords.js your-email@example.com

# Clear browser session
# (Open browser console, run:)
sessionStorage.clear(); localStorage.clear();
\`\`\`

## Files Modified in the Fix

1. `src/app/api/auth/salt/route.ts` - New endpoint to fetch user salt
2. `src/app/(auth)/login/page.tsx` - Updated to use correct salt
3. `src/hooks/usePasswordsQuery.ts` - Better error logging
4. `scripts/check-user-salt.js` - Diagnostic tool
5. `scripts/delete-all-passwords.js` - Clean slate tool

## Security Note

Using email as salt was a **critical security vulnerability**:
- ❌ Predictable - same email always produces same key
- ❌ Not random - violates cryptographic best practices  
- ❌ Allows rainbow table attacks

Using a **random 32-byte salt** (the fix):
- ✅ Unique per user
- ✅ Cryptographically secure random generation
- ✅ Follows OWASP guidelines
- ✅ Makes rainbow table attacks infeasible
