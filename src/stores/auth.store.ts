"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  UserPublic,
  LoginResponse,
  RegisterResponse,
  MfaVerifyResponse,
} from "@/types";

interface AuthState {
  // State
  user: UserPublic | null;
  accessToken: string | null;
  refreshToken: string | null;
  mfaToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  login: (
    email: string,
    authHash: string,
  ) => Promise<{ success: boolean; requiresMfa?: boolean }>;
  register: (
    email: string,
    authHash: string,
    salt: string,
    encryptedVaultKey: string,
    displayName?: string,
  ) => Promise<{ success: boolean }>;
  verifyMfa: (
    code: string,
    isBackupCode?: boolean,
  ) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;

  // State actions
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

// API helper
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const json = await response.json();

    if (!response.ok) {
      return { success: false, error: json.message || "Request failed" };
    }

    return { success: true, data: json.data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      mfaToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (email, authHash) => {
        set({ isLoading: true, error: null });

        const result = await apiCall<LoginResponse>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, authHash }),
        });

        if (!result.success) {
          set({ isLoading: false, error: result.error });
          return { success: false };
        }

        const data = result.data as LoginResponse;

        // Check if MFA is required
        if (data.requiresMfa && data.mfaToken) {
          set({
            mfaToken: data.mfaToken,
            isLoading: false,
          });
          return { success: true, requiresMfa: true };
        }

        // Full login success
        set({
          user: data.user!,
          accessToken: data.accessToken!,
          refreshToken: data.refreshToken!,
          mfaToken: null,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true, requiresMfa: false };
      },

      // Register
      register: async (
        email,
        authHash,
        salt,
        encryptedVaultKey,
        displayName,
      ) => {
        set({ isLoading: true, error: null });

        const result = await apiCall<RegisterResponse>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            email,
            authHash,
            salt,
            encryptedVaultKey,
            name: displayName,
          }),
        });

        if (!result.success) {
          set({ isLoading: false, error: result.error });
          return { success: false };
        }

        const data = result.data!;

        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      },

      // MFA Verification
      verifyMfa: async (code, isBackupCode = false) => {
        const { mfaToken } = get();

        if (!mfaToken) {
          set({ error: "No MFA session active" });
          return { success: false };
        }

        set({ isLoading: true, error: null });

        const result = await apiCall<MfaVerifyResponse>(
          "/api/auth/mfa/verify",
          {
            method: "POST",
            body: JSON.stringify({
              mfaToken,
              code,
              isBackupCode,
            }),
          },
        );

        if (!result.success) {
          set({ isLoading: false, error: result.error });
          return { success: false };
        }

        const data = result.data!;

        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          mfaToken: null,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      },

      // Logout
      logout: async () => {
        const { accessToken, refreshToken } = get();

        if (accessToken && refreshToken) {
          await apiCall("/api/auth/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refreshToken }),
          });
        }

        get().clearAuth();
      },

      // Refresh tokens
      refreshTokens: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          get().clearAuth();
          return false;
        }

        const result = await apiCall<{
          accessToken: string;
          refreshToken: string;
        }>("/api/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });

        if (!result.success) {
          get().clearAuth();
          return false;
        }

        set({
          accessToken: result.data!.accessToken,
          refreshToken: result.data!.refreshToken,
        });

        return true;
      },

      // Helpers
      setError: (error) => set({ error }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          mfaToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "securevault-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
