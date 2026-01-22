"use client";

import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { deriveKeys } from "@/lib/crypto/client";
import { useAuthStore } from "@/stores/auth.store";
import { useVaultStore } from "@/stores/vault.store";

interface UseAuthFlowReturn {
  isLoading: boolean;
  error: string | null;
  pendingVerification: { token: string; email: string } | null;
  login: (email: string, masterPassword: string) => Promise<boolean>;
  startRegistration: (
    email: string,
    masterPassword: string,
    displayName?: string,
  ) => Promise<{ success: boolean; token?: string }>;
  completeRegistration: (code: string) => Promise<boolean>;
  verifyMfa: (code: string, isBackupCode?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  clearPendingVerification: () => void;
}

export function useAuthFlow(): UseAuthFlowReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState<{
    token: string;
    email: string;
    authHash: string;
    encryptionKey: CryptoKey;
  } | null>(null);

  const authStore = useAuthStore();
  const vaultStore = useVaultStore();

  /**
   * Complete login flow with key derivation
   */
  const login = useCallback(
    async (email: string, masterPassword: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Fetch the user's salt from the server
        const saltResponse = await fetch("/api/auth/salt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!saltResponse.ok) {
          setError("Failed to fetch authentication data");
          setIsLoading(false);
          return false;
        }

        const saltData = await saltResponse.json();
        const salt = saltData.data?.salt;

        if (!salt) {
          setError("Invalid authentication data");
          setIsLoading(false);
          return false;
        }

        // Step 2: Derive keys from master password using the fetched salt
        const { authKey, encryptionKey } = await deriveKeys(
          masterPassword,
          salt,
        );

        // Convert authKey to hex string for transmission
        const authKeyBytes = await crypto.subtle.exportKey("raw", authKey);
        const authHash = Array.from(new Uint8Array(authKeyBytes))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Step 3: Call login API
        const result = await authStore.login(email, authHash);

        if (!result.success) {
          setError(authStore.error || "Login failed");
          return false;
        }

        // If MFA required, we're done here - user needs to verify
        if (result.requiresMfa) {
          setIsLoading(false);
          return true;
        }

        // Step 4: Set up vault with encryption key
        vaultStore.setEncryptionKey(encryptionKey);

        // Save to sessionStorage so it survives page refresh
        const exportedKey = await crypto.subtle.exportKey("jwk", encryptionKey);
        sessionStorage.setItem("vault_key", JSON.stringify(exportedKey));

        // Step 5: Fetch and decrypt vault
        await vaultStore.fetchVault();

        setIsLoading(false);
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        setIsLoading(false);
        return false;
      }
    },
    [authStore, vaultStore],
  );

  /**
   * Start registration flow - sends verification email
   */
  const startRegistration = useCallback(
    async (
      email: string,
      masterPassword: string,
      displayName?: string,
    ): Promise<{ success: boolean; token?: string }> => {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Generate a random salt for this user
        const saltBytes = crypto.getRandomValues(new Uint8Array(32));
        const salt = Array.from(saltBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Step 2: Derive keys from master password using the salt
        const { authHash, encryptionKey } = await deriveKeys(
          masterPassword,
          salt,
        );

        // Step 3: Generate a random vault key and encrypt it with the encryption key
        const vaultKey = crypto.getRandomValues(new Uint8Array(32));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedVaultKeyBuffer = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          encryptionKey,
          vaultKey,
        );
        // Store IV + encrypted data together
        const encryptedVaultKey =
          Array.from(iv)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("") +
          Array.from(new Uint8Array(encryptedVaultKeyBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        // Step 4: Send verification email with registration data
        const response = await fetch("/api/auth/verify-email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: displayName,
            authHash,
            salt,
            encryptedVaultKey,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Failed to send verification email");
          setIsLoading(false);
          return { success: false };
        }

        // Store pending verification data including authHash for NextAuth sign-in
        setPendingVerification({
          token: result.data.token,
          email,
          authHash,
          encryptionKey,
        });

        setIsLoading(false);
        return { success: true, token: result.data.token };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        setIsLoading(false);
        return { success: false };
      }
    },
    [],
  );

  /**
   * Complete registration - verify code and create account
   */
  const completeRegistration = useCallback(
    async (code: string): Promise<boolean> => {
      if (!pendingVerification) {
        setError("No pending verification. Please start registration again.");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Verify the code and complete registration
        const response = await fetch("/api/auth/verify-email/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: pendingVerification.token,
            code,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Verification failed");
          setIsLoading(false);
          return false;
        }

        // Update auth store with the new user data
        authStore.setUser(result.data.user);

        // Sign in with NextAuth to create a proper session
        const signInResult = await signIn("credentials", {
          email: pendingVerification.email,
          authHash: pendingVerification.authHash,
          redirect: false,
        });

        if (signInResult?.error) {
          console.error(
            "NextAuth sign-in after registration failed:",
            signInResult.error,
          );
          // Registration succeeded but session creation failed
          // User will need to log in manually
          setError("Account created. Please log in.");
          setIsLoading(false);
          return false;
        }

        // Set up vault with encryption key we saved
        vaultStore.setEncryptionKey(pendingVerification.encryptionKey);

        // Save to sessionStorage so it survives page refresh
        const exportedKey = await crypto.subtle.exportKey(
          "jwk",
          pendingVerification.encryptionKey,
        );
        sessionStorage.setItem("vault_key", JSON.stringify(exportedKey));

        // Don't clear pending verification or set loading to false here
        // This prevents a flash of the registration form before redirect
        // The caller will handle navigation, and we want to keep the UI stable

        // Fetch initial vault (will have default categories)
        await vaultStore.fetchVault();

        // Return true but DON'T set isLoading to false - keep the loading state
        // The page navigation will handle cleanup
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        setIsLoading(false);
        return false;
      }
    },
    [pendingVerification, authStore, vaultStore],
  );

  /**
   * Clear pending verification state
   */
  const clearPendingVerification = useCallback(() => {
    setPendingVerification(null);
    setError(null);
  }, []);

  /**
   * MFA verification with vault unlock
   */
  const verifyMfa = useCallback(
    async (code: string, isBackupCode = false): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await authStore.verifyMfa(code, isBackupCode);

        if (!result.success) {
          setError(authStore.error || "MFA verification failed");
          return false;
        }

        // After MFA, we need to re-derive keys (user would need to enter password again)
        // Or we could temporarily store the encryption key during the MFA flow
        // For now, we'll assume the vault key is already set from the initial login attempt

        // Fetch vault
        if (vaultStore.encryptionKey) {
          await vaultStore.fetchVault();
        }

        setIsLoading(false);
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        setIsLoading(false);
        return false;
      }
    },
    [authStore, vaultStore],
  );

  /**
   * Logout and lock vault
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Lock vault first
      vaultStore.lockVault();

      // Then logout
      await authStore.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, [authStore, vaultStore]);

  return {
    isLoading: isLoading || authStore.isLoading,
    error: error || authStore.error,
    pendingVerification: pendingVerification
      ? { token: pendingVerification.token, email: pendingVerification.email }
      : null,
    login,
    startRegistration,
    completeRegistration,
    verifyMfa,
    logout,
    clearPendingVerification,
  };
}
