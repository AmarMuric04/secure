"use client";

import { create } from "zustand";
import type { PasswordEntry, Category, VaultResponse } from "@/types";

// ============================================================================
// Types for Decrypted Data
// ============================================================================

export interface DecryptedPasswordEntry {
  _id: string;
  // Decrypted fields
  title: string;
  username?: string;
  password: string;
  url?: string;
  notes?: string;
  customFields?: Array<{
    name: string;
    value: string;
    type: "text" | "password" | "hidden";
  }>;
  // Metadata (from server)
  categoryId?: string;
  tags: string[];
  favorite: boolean;
  passwordStrength: 0 | 1 | 2 | 3 | 4;
  isCompromised: boolean;
  isReused: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

interface VaultState {
  // State
  passwords: DecryptedPasswordEntry[];
  categories: Category[];
  tags: string[];
  encryptionKey: CryptoKey | null;
  isLoading: boolean;
  isLocked: boolean;
  error: string | null;
  lastSync: Date | null;

  // Key management
  setEncryptionKey: (key: CryptoKey) => void;
  lockVault: () => void;

  // Vault operations
  fetchVault: () => Promise<boolean>;

  // Password operations
  addPassword: (
    entry: Omit<DecryptedPasswordEntry, "_id" | "createdAt" | "updatedAt">,
  ) => Promise<string | null>;
  updatePassword: (
    id: string,
    entry: Partial<DecryptedPasswordEntry>,
  ) => Promise<boolean>;
  deletePassword: (id: string, permanent?: boolean) => Promise<boolean>;
  restorePassword: (id: string) => Promise<boolean>;

  // Category operations
  addCategory: (
    name: string,
    icon?: string,
    color?: string,
  ) => Promise<string | null>;
  updateCategory: (
    id: string,
    updates: { name?: string; icon?: string; color?: string },
  ) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Helpers
  getPasswordById: (id: string) => DecryptedPasswordEntry | undefined;
  getPasswordsByCategory: (categoryId: string) => DecryptedPasswordEntry[];
  getFavorites: () => DecryptedPasswordEntry[];
  getDeleted: () => DecryptedPasswordEntry[];
  searchPasswords: (query: string) => DecryptedPasswordEntry[];
}

// ============================================================================
// Encryption Helpers
// ============================================================================

async function encryptData(
  data: object,
  key: CryptoKey,
): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(JSON.stringify(data)),
  );

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

async function decryptData<T>(
  encrypted: string,
  iv: string,
  key: CryptoKey,
): Promise<T> {
  const decoder = new TextDecoder();

  const encryptedBytes = Uint8Array.from(atob(encrypted), (c) =>
    c.charCodeAt(0),
  );
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    encryptedBytes,
  );

  return JSON.parse(decoder.decode(decryptedBuffer));
}

// ============================================================================
// API Helper
// ============================================================================

async function vaultApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(endpoint, {
      credentials: "include", // Include cookies for NextAuth session
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: json.error?.message || json.message || "Request failed",
      };
    }

    return { success: true, data: json.data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ============================================================================
// Vault Store
// ============================================================================

export const useVaultStore = create<VaultState>()((set, get) => ({
  // Initial state
  passwords: [],
  categories: [],
  tags: [],
  encryptionKey: null,
  isLoading: false,
  isLocked: true,
  error: null,
  lastSync: null,

  // Key management
  setEncryptionKey: (key) => set({ encryptionKey: key, isLocked: false }),

  lockVault: () =>
    set({
      encryptionKey: null,
      passwords: [],
      isLocked: true,
    }),

  // Fetch and decrypt entire vault
  fetchVault: async () => {
    const { encryptionKey } = get();

    if (!encryptionKey) {
      set({ error: "Vault is locked" });
      return false;
    }

    set({ isLoading: true, error: null });

    const result = await vaultApi<VaultResponse>("/api/vault");

    if (!result.success) {
      set({ isLoading: false, error: result.error });
      return false;
    }

    const vault = result.data!;

    // Decrypt all passwords
    try {
      const decryptedPasswords: DecryptedPasswordEntry[] = await Promise.all(
        vault.passwords.map(async (entry) => {
          const decryptedData = await decryptData<{
            title: string;
            username?: string;
            password: string;
            url?: string;
            notes?: string;
            customFields?: Array<{
              name: string;
              value: string;
              type: "text" | "password" | "hidden";
            }>;
          }>(entry.encryptedData, entry.iv, encryptionKey);

          return {
            _id: entry._id,
            ...decryptedData,
            categoryId: entry.categoryId,
            tags: entry.tags,
            favorite: entry.favorite,
            passwordStrength: entry.passwordStrength,
            isCompromised: entry.isCompromised,
            isReused: entry.isReused,
            deletedAt: entry.deletedAt,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            lastUsedAt: entry.lastUsedAt,
          };
        }),
      );

      set({
        passwords: decryptedPasswords,
        categories: vault.categories,
        tags: vault.tags,
        isLoading: false,
        lastSync: new Date(),
      });

      return true;
    } catch {
      set({
        isLoading: false,
        error: "Failed to decrypt vault. Invalid encryption key.",
      });
      return false;
    }
  },

  // Add a new password
  addPassword: async (entry) => {
    const { encryptionKey, passwords } = get();

    if (!encryptionKey) {
      set({ error: "Vault is locked" });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      // Encrypt sensitive data
      const sensitiveData = {
        title: entry.title,
        username: entry.username,
        password: entry.password,
        url: entry.url,
        notes: entry.notes,
        customFields: entry.customFields,
      };

      const { encrypted, iv } = await encryptData(sensitiveData, encryptionKey);

      const result = await vaultApi<{ password: PasswordEntry }>(
        "/api/vault/passwords",
        {
          method: "POST",
          body: JSON.stringify({
            encryptedData: encrypted,
            iv,
            metadata: {
              categoryId: entry.categoryId,
              tags: entry.tags,
              favorite: entry.favorite,
              passwordStrength: entry.passwordStrength,
              isCompromised: entry.isCompromised,
              isReused: entry.isReused,
            },
          }),
        },
      );

      if (!result.success) {
        set({ isLoading: false, error: result.error });
        return null;
      }

      const newEntry = result.data!.password;

      // Add to local state
      const decryptedEntry: DecryptedPasswordEntry = {
        _id: newEntry._id,
        ...sensitiveData,
        categoryId: newEntry.categoryId,
        tags: newEntry.tags,
        favorite: newEntry.favorite,
        passwordStrength: newEntry.passwordStrength,
        isCompromised: newEntry.isCompromised,
        isReused: newEntry.isReused,
        deletedAt: newEntry.deletedAt,
        createdAt: newEntry.createdAt,
        updatedAt: newEntry.updatedAt,
        lastUsedAt: newEntry.lastUsedAt,
      };

      set({
        passwords: [...passwords, decryptedEntry],
        isLoading: false,
      });

      return newEntry._id;
    } catch {
      set({ isLoading: false, error: "Failed to encrypt password" });
      return null;
    }
  },

  // Update a password
  updatePassword: async (id, updates) => {
    const { encryptionKey, passwords } = get();

    if (!encryptionKey) {
      set({ error: "Vault is locked" });
      return false;
    }

    const existingPassword = passwords.find((p) => p._id === id);
    if (!existingPassword) {
      set({ error: "Password not found" });
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      // Merge updates with existing data
      const updatedData = { ...existingPassword, ...updates };

      // Encrypt sensitive data
      const sensitiveData = {
        title: updatedData.title,
        username: updatedData.username,
        password: updatedData.password,
        url: updatedData.url,
        notes: updatedData.notes,
        customFields: updatedData.customFields,
      };

      const { encrypted, iv } = await encryptData(sensitiveData, encryptionKey);

      const result = await vaultApi(`/api/vault/passwords/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          encryptedData: encrypted,
          iv,
          metadata: {
            categoryId: updatedData.categoryId,
            tags: updatedData.tags,
            favorite: updatedData.favorite,
            passwordStrength: updatedData.passwordStrength,
            isCompromised: updatedData.isCompromised,
            isReused: updatedData.isReused,
          },
        }),
      });

      if (!result.success) {
        set({ isLoading: false, error: result.error });
        return false;
      }

      // Update local state
      set({
        passwords: passwords.map((p) =>
          p._id === id ? { ...p, ...updates, updatedAt: new Date() } : p,
        ),
        isLoading: false,
      });

      return true;
    } catch {
      set({ isLoading: false, error: "Failed to update password" });
      return false;
    }
  },

  // Delete a password
  deletePassword: async (id, permanent = false) => {
    const { passwords } = get();

    set({ isLoading: true, error: null });

    const result = await vaultApi(
      `/api/vault/passwords/${id}${permanent ? "?permanent=true" : ""}`,
      {
        method: "DELETE",
      },
    );

    if (!result.success) {
      set({ isLoading: false, error: result.error });
      return false;
    }

    if (permanent) {
      // Remove from local state
      set({
        passwords: passwords.filter((p) => p._id !== id),
        isLoading: false,
      });
    } else {
      // Mark as deleted (soft delete)
      set({
        passwords: passwords.map((p) =>
          p._id === id ? { ...p, deletedAt: new Date() } : p,
        ),
        isLoading: false,
      });
    }

    return true;
  },

  // Restore a deleted password
  restorePassword: async (id) => {
    const { passwords } = get();

    set({ isLoading: true, error: null });

    const result = await vaultApi(`/api/vault/passwords/${id}/restore`, {
      method: "POST",
    });

    if (!result.success) {
      set({ isLoading: false, error: result.error });
      return false;
    }

    set({
      passwords: passwords.map((p) =>
        p._id === id ? { ...p, deletedAt: undefined } : p,
      ),
      isLoading: false,
    });

    return true;
  },

  // Add a category
  addCategory: async (name, icon, color) => {
    set({ isLoading: true, error: null });

    const result = await vaultApi<{ category: Category }>(
      "/api/vault/categories",
      {
        method: "POST",
        body: JSON.stringify({ name, icon, color }),
      },
    );

    if (!result.success) {
      set({ isLoading: false, error: result.error });
      return null;
    }

    const newCategory = result.data!.category;

    set((state) => ({
      categories: [...state.categories, newCategory],
      isLoading: false,
    }));

    return newCategory._id;
  },

  // Update a category
  updateCategory: async (id, updates) => {
    set({ isLoading: true, error: null });

    const result = await vaultApi(`/api/vault/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    if (!result.success) {
      set({ isLoading: false, error: result.error });
      return false;
    }

    set((state) => ({
      categories: state.categories.map((c) =>
        c._id === id ? { ...c, ...updates, updatedAt: new Date() } : c,
      ),
      isLoading: false,
    }));

    return true;
  },

  // Delete a category
  deleteCategory: async (id) => {
    const { passwords } = get();

    set({ isLoading: true, error: null });

    const result = await vaultApi(`/api/vault/categories/${id}`, {
      method: "DELETE",
    });

    if (!result.success) {
      set({ isLoading: false, error: result.error });
      return false;
    }

    // Remove category and uncategorize passwords
    set((state) => ({
      categories: state.categories.filter((c) => c._id !== id),
      passwords: passwords.map((p) =>
        p.categoryId === id ? { ...p, categoryId: undefined } : p,
      ),
      isLoading: false,
    }));

    return true;
  },

  // Helper: Get password by ID
  getPasswordById: (id) => {
    return get().passwords.find((p) => p._id === id);
  },

  // Helper: Get passwords by category
  getPasswordsByCategory: (categoryId) => {
    return get().passwords.filter(
      (p) => p.categoryId === categoryId && !p.deletedAt,
    );
  },

  // Helper: Get favorites
  getFavorites: () => {
    return get().passwords.filter((p) => p.favorite && !p.deletedAt);
  },

  // Helper: Get deleted (trash)
  getDeleted: () => {
    return get().passwords.filter((p) => !!p.deletedAt);
  },

  // Helper: Search passwords
  searchPasswords: (query) => {
    const q = query.toLowerCase();
    return get().passwords.filter(
      (p) =>
        !p.deletedAt &&
        (p.title.toLowerCase().includes(q) ||
          p.username?.toLowerCase().includes(q) ||
          p.url?.toLowerCase().includes(q) ||
          p.notes?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))),
    );
  },
}));
