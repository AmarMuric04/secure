"use client";

import { useCallback, useState } from "react";
import { deriveKeys } from "@/lib/crypto/client";
import { useAuthStore } from "@/stores/auth.store";
import { useVaultStore } from "@/stores/vault.store";

interface UseAuthFlowReturn {
  isLoading: boolean;
  error: string | null;
  login: (email: string, masterPassword: string) => Promise<boolean>;
  register: (
    email: string,
    masterPassword: string,
    displayName?: string,
  ) => Promise<boolean>;
  verifyMfa: (code: string, isBackupCode?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
}

export function useAuthFlow(): UseAuthFlowReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Step 1: Derive keys from master password
        const { authKey } = await deriveKeys(masterPassword, email);

        // Convert authKey to hex string for transmission
        const authKeyBytes = await crypto.subtle.exportKey("raw", authKey);
        const authHash = Array.from(new Uint8Array(authKeyBytes))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Step 2: Call login API
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

        // Step 3: Import vault key and unlock vault
        // Note: In a real implementation, you'd get the encrypted vault key from the response
        // and decrypt it with the derived encryption key
        const { encryptionKey } = await deriveKeys(masterPassword, email);
        vaultStore.setEncryptionKey(encryptionKey);

        // Save to sessionStorage so it survives page refresh
        const exportedKey = await crypto.subtle.exportKey("jwk", encryptionKey);
        sessionStorage.setItem("vault_key", JSON.stringify(exportedKey));

        // Step 4: Fetch and decrypt vault
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
   * Complete registration flow with key generation
   */
  const register = useCallback(
    async (
      email: string,
      masterPassword: string,
      displayName?: string,
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Generate a random salt for this user
        const saltBytes = crypto.getRandomValues(new Uint8Array(32));
        const salt = Array.from(saltBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Step 2: Derive keys from master password using the salt
        const { authKey, encryptionKey } = await deriveKeys(
          masterPassword,
          salt,
        );

        // Convert authKey to hex string for transmission
        const authKeyBytes = await crypto.subtle.exportKey("raw", authKey);
        const authHash = Array.from(new Uint8Array(authKeyBytes))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

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

        // Step 4: Call register API with all required data
        const result = await authStore.register(
          email,
          authHash,
          salt,
          encryptedVaultKey,
          displayName,
        );

        if (!result.success) {
          setError(authStore.error || "Registration failed");
          return false;
        }

        // Step 5: Set up vault with encryption key
        vaultStore.setEncryptionKey(encryptionKey);

        // Save to sessionStorage so it survives page refresh
        const exportedKey = await crypto.subtle.exportKey("jwk", encryptionKey);
        sessionStorage.setItem("vault_key", JSON.stringify(exportedKey));

        // Step 6: Fetch initial vault (will have default categories)
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
    login,
    register,
    verifyMfa,
    logout,
  };
}
