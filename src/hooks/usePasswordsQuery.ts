"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVaultStore, type DecryptedPasswordEntry } from "@/stores";
import type { PasswordEntry, Category } from "@/types";
import { generatePassword, generatePassphrase } from "@/lib/crypto/client";

// ============================================================================
// Query Keys Factory
// ============================================================================

export const passwordKeys = {
  all: ["passwords"] as const,
  lists: () => [...passwordKeys.all, "list"] as const,
  list: (filters: PasswordFilters) =>
    [...passwordKeys.lists(), filters] as const,
  details: () => [...passwordKeys.all, "detail"] as const,
  detail: (id: string) => [...passwordKeys.details(), id] as const,
  favorites: () => [...passwordKeys.all, "favorites"] as const,
  trash: () => [...passwordKeys.all, "trash"] as const,
  categories: () => ["categories"] as const,
};

// ============================================================================
// Types
// ============================================================================

interface PasswordFilters {
  categoryId?: string;
  favorite?: boolean;
  tag?: string;
  includeDeleted?: boolean;
  search?: string;
}

interface VaultResponse {
  passwords: PasswordEntry[];
  categories: Category[];
  tags: string[];
}

interface CreatePasswordInput {
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
  categoryId?: string;
  tags?: string[];
  favorite?: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchVaultData(includeDeleted = false): Promise<VaultResponse> {
  const url = new URL("/api/vault", window.location.origin);
  if (includeDeleted) {
    url.searchParams.set("includeDeleted", "true");
  }

  const response = await fetch(url.toString(), {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || "Failed to fetch vault");
  }

  const json = await response.json();
  return json.data;
}

async function createPassword(
  encryptedData: string,
  iv: string,
  metadata: {
    categoryId?: string;
    tags: string[];
    favorite: boolean;
    passwordStrength: 0 | 1 | 2 | 3 | 4;
    isCompromised: boolean;
    isReused: boolean;
  },
): Promise<PasswordEntry> {
  const response = await fetch("/api/vault/passwords", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      encryptedData,
      iv,
      metadata,
    }),
  });

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || "Failed to create password");
  }

  const json = await response.json();
  return json.data.password;
}

async function deletePasswordApi(id: string, permanent = false): Promise<void> {
  const url = permanent
    ? `/api/vault/passwords/${id}?permanent=true`
    : `/api/vault/passwords/${id}`;

  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || "Failed to delete password");
  }
}

async function restorePasswordApi(id: string): Promise<PasswordEntry> {
  const response = await fetch(`/api/vault/passwords/${id}/restore`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || "Failed to restore password");
  }

  const json = await response.json();
  return json.data;
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
// Password Strength Helper
// ============================================================================

function calculateStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  // Normalize to 0-4 scale
  return Math.min(4, Math.floor(score * 0.67)) as 0 | 1 | 2 | 3 | 4;
}

// ============================================================================
// Password Generation Helper
// ============================================================================

interface PasswordGenerationOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeAmbiguous?: boolean;
  excludeCharacters?: string;
}

function generateSecurePassword(
  options: PasswordGenerationOptions = {},
): string {
  return generatePassword({
    length: options.length || 20,
    uppercase: options.includeUppercase ?? true,
    lowercase: options.includeLowercase ?? true,
    numbers: options.includeNumbers ?? true,
    symbols: options.includeSymbols ?? true,
    excludeAmbiguous: options.excludeAmbiguous ?? false,
    excludeCharacters: options.excludeCharacters ?? "",
  });
}

interface PassphraseOptions {
  wordCount?: number;
  separator?: string;
  capitalize?: boolean;
  includeNumber?: boolean;
}

function generateSecurePassphrase(options: PassphraseOptions = {}): string {
  return generatePassphrase(
    options.wordCount || 4,
    options.separator || "-",
    options.capitalize ?? true,
    options.includeNumber ?? true,
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch and manage passwords using TanStack Query
 * Handles client-side decryption using the vault's encryption key
 */
export function usePasswordsQuery(filters: PasswordFilters = {}) {
  const queryClient = useQueryClient();
  const encryptionKey = useVaultStore((state) => state.encryptionKey);
  const isLocked = useVaultStore((state) => state.isLocked);

  // Main passwords query
  const passwordsQuery = useQuery({
    queryKey: passwordKeys.list(filters),
    queryFn: async (): Promise<DecryptedPasswordEntry[]> => {
      if (!encryptionKey) {
        throw new Error("Vault is locked");
      }

      const vault = await fetchVaultData(filters.includeDeleted);

      // Decrypt all passwords in parallel, handling failures gracefully
      const decryptionResults = await Promise.allSettled(
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

      // Filter out failed decryptions and extract successful ones
      const decryptedPasswords: DecryptedPasswordEntry[] = [];
      let failedDecryptions = 0;

      for (const result of decryptionResults) {
        if (result.status === "fulfilled") {
          decryptedPasswords.push(result.value);
        } else {
          failedDecryptions++;
          console.error(
            "[usePasswordsQuery] Failed to decrypt password:",
            result.reason,
          );
        }
      }

      // If all passwords failed to decrypt, this likely means they were encrypted with a different key
      if (vault.passwords.length > 0 && decryptedPasswords.length === 0) {
        console.error(
          `[usePasswordsQuery] CRITICAL: All ${vault.passwords.length} passwords failed to decrypt!`,
          "This usually means passwords were encrypted with a different key (e.g., during registration with wrong salt).",
          "You may need to delete existing passwords from the database and create new ones.",
        );
      } else if (failedDecryptions > 0) {
        console.warn(
          `[usePasswordsQuery] ${failedDecryptions} of ${vault.passwords.length} passwords failed to decrypt`,
        );
      }

      // Apply client-side filters
      let filtered = decryptedPasswords;

      if (!filters.includeDeleted) {
        filtered = filtered.filter((p) => !p.deletedAt);
      }

      if (filters.categoryId) {
        filtered = filtered.filter((p) => p.categoryId === filters.categoryId);
      }

      if (filters.favorite) {
        filtered = filtered.filter((p) => p.favorite);
      }

      if (filters.tag) {
        filtered = filtered.filter((p) => p.tags.includes(filters.tag!));
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(searchLower) ||
            p.username?.toLowerCase().includes(searchLower) ||
            p.url?.toLowerCase().includes(searchLower) ||
            p.notes?.toLowerCase().includes(searchLower),
        );
      }

      return filtered;
    },
    enabled: !isLocked && !!encryptionKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Derived data
  const passwords = passwordsQuery.data ?? [];
  const favorites = passwords.filter((p) => p.favorite && !p.deletedAt);
  const trash = passwords.filter((p) => !!p.deletedAt);

  // Create password mutation
  const createPasswordMutation = useMutation({
    mutationFn: async (input: CreatePasswordInput) => {
      if (!encryptionKey) {
        throw new Error("Vault is locked");
      }

      // Check for password reuse
      const existingPasswords = queryClient.getQueryData<
        DecryptedPasswordEntry[]
      >(passwordKeys.list({}));
      const isReused =
        existingPasswords?.some(
          (p) => p.password === input.password && !p.deletedAt,
        ) ?? false;

      // Calculate password strength
      const passwordStrength = calculateStrength(input.password);

      // Encrypt sensitive data
      const sensitiveData = {
        title: input.title,
        username: input.username,
        password: input.password,
        url: input.url,
        notes: input.notes,
        customFields: input.customFields,
      };

      const { encrypted, iv } = await encryptData(sensitiveData, encryptionKey);

      // Create on server
      const newEntry = await createPassword(encrypted, iv, {
        categoryId: input.categoryId,
        tags: input.tags || [],
        favorite: input.favorite || false,
        passwordStrength,
        isCompromised: false,
        isReused,
      });

      // Return decrypted entry for optimistic update
      return {
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
      } as DecryptedPasswordEntry;
    },
    onSuccess: (newEntry) => {
      // Optimistically update the cache
      queryClient.setQueryData<DecryptedPasswordEntry[]>(
        passwordKeys.list({}),
        (old) => (old ? [...old, newEntry] : [newEntry]),
      );

      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: passwordKeys.lists() });
    },
  });

  // Delete password mutation
  const deletePasswordMutation = useMutation({
    mutationFn: async ({
      id,
      permanent = false,
    }: {
      id: string;
      permanent?: boolean;
    }) => {
      await deletePasswordApi(id, permanent);
      return { id, permanent };
    },
    onMutate: async ({ id, permanent }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: passwordKeys.lists() });

      // Snapshot the previous value
      const previousPasswords = queryClient.getQueryData<
        DecryptedPasswordEntry[]
      >(passwordKeys.list({}));

      // Optimistically update
      queryClient.setQueryData<DecryptedPasswordEntry[]>(
        passwordKeys.list({}),
        (old) => {
          if (!old) return old;
          if (permanent) {
            return old.filter((p) => p._id !== id);
          }
          return old.map((p) =>
            p._id === id ? { ...p, deletedAt: new Date() } : p,
          );
        },
      );

      return { previousPasswords };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousPasswords) {
        queryClient.setQueryData(
          passwordKeys.list({}),
          context.previousPasswords,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: passwordKeys.lists() });
    },
  });

  // Restore password mutation
  const restorePasswordMutation = useMutation({
    mutationFn: async (id: string) => {
      await restorePasswordApi(id);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: passwordKeys.lists() });

      const previousPasswords = queryClient.getQueryData<
        DecryptedPasswordEntry[]
      >(passwordKeys.list({}));

      queryClient.setQueryData<DecryptedPasswordEntry[]>(
        passwordKeys.list({}),
        (old) =>
          old?.map((p) => (p._id === id ? { ...p, deletedAt: undefined } : p)),
      );

      return { previousPasswords };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPasswords) {
        queryClient.setQueryData(
          passwordKeys.list({}),
          context.previousPasswords,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: passwordKeys.lists() });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CreatePasswordInput>;
    }) => {
      if (!encryptionKey) {
        throw new Error("Vault is locked");
      }

      // Get the existing password data
      const existingPasswords = queryClient.getQueryData<
        DecryptedPasswordEntry[]
      >(passwordKeys.list({}));
      const existingPassword = existingPasswords?.find((p) => p._id === id);

      if (!existingPassword) {
        throw new Error("Password not found");
      }

      // Merge existing data with updates
      const sensitiveData = {
        title: updates.title ?? existingPassword.title,
        username: updates.username ?? existingPassword.username,
        password: updates.password ?? existingPassword.password,
        url: updates.url ?? existingPassword.url,
        notes: updates.notes ?? existingPassword.notes,
        customFields: updates.customFields ?? existingPassword.customFields,
      };

      // Check for password reuse if password is being updated
      let isReused = existingPassword.isReused;
      let passwordStrength = existingPassword.passwordStrength;
      if (updates.password && updates.password !== existingPassword.password) {
        isReused =
          existingPasswords?.some(
            (p) =>
              p._id !== id && p.password === updates.password && !p.deletedAt,
          ) ?? false;
        passwordStrength = calculateStrength(updates.password);
      }

      const { encrypted, iv } = await encryptData(sensitiveData, encryptionKey);

      const response = await fetch(`/api/vault/passwords/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encryptedData: encrypted,
          iv,
          metadata: {
            categoryId: updates.categoryId ?? existingPassword.categoryId,
            tags: updates.tags ?? existingPassword.tags,
            favorite: updates.favorite ?? existingPassword.favorite,
            passwordStrength,
            isCompromised: existingPassword.isCompromised,
            isReused,
          },
        }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error?.message || "Failed to update password");
      }

      const json = await response.json();
      const entry = json.data as PasswordEntry;

      // Return decrypted entry
      return {
        _id: entry._id,
        ...sensitiveData,
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
      } as DecryptedPasswordEntry;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: passwordKeys.lists() });

      const previousPasswords = queryClient.getQueryData<
        DecryptedPasswordEntry[]
      >(passwordKeys.list({}));

      queryClient.setQueryData<DecryptedPasswordEntry[]>(
        passwordKeys.list({}),
        (old) =>
          old?.map((p) =>
            p._id === id
              ? {
                  ...p,
                  ...updates,
                  updatedAt: new Date(),
                }
              : p,
          ),
      );

      return { previousPasswords };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPasswords) {
        queryClient.setQueryData(
          passwordKeys.list({}),
          context.previousPasswords,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: passwordKeys.lists() });
    },
  });

  return {
    // Data
    passwords,
    favorites,
    trash,

    // Query state
    isLoading: passwordsQuery.isLoading,
    isPending: passwordsQuery.isPending,
    isFetching: passwordsQuery.isFetching,
    isError: passwordsQuery.isError,
    error: passwordsQuery.error,

    // Whether the vault is ready (encryption key available)
    isVaultReady: !isLocked && !!encryptionKey,

    // Refetch
    refetch: passwordsQuery.refetch,

    // Mutations
    createPassword: createPasswordMutation.mutateAsync,
    isCreating: createPasswordMutation.isPending,
    createError: createPasswordMutation.error,

    deletePassword: (id: string, permanent?: boolean) =>
      deletePasswordMutation.mutateAsync({ id, permanent }),
    isDeleting: deletePasswordMutation.isPending,

    restorePassword: restorePasswordMutation.mutateAsync,
    isRestoring: restorePasswordMutation.isPending,

    updatePassword: (id: string, updates: Partial<CreatePasswordInput>) =>
      updatePasswordMutation.mutateAsync({ id, updates }),
    isUpdating: updatePasswordMutation.isPending,

    // Toggle favorite helper
    toggleFavorite: async (id: string) => {
      const password = passwords.find((p) => p._id === id);
      if (!password) return;
      await updatePasswordMutation.mutateAsync({
        id,
        updates: { favorite: !password.favorite },
      });
    },

    // Helpers
    getById: (id: string) => passwords.find((p) => p._id === id),
    getByCategory: (categoryId: string) =>
      passwords.filter((p) => p.categoryId === categoryId),

    // Password utilities
    generateSecurePassword,
    generateSecurePassphrase,
    analyzeStrength: calculateStrength,
  };
}

/**
 * Hook to fetch a single password by ID
 */
export function usePasswordQuery(id: string) {
  const encryptionKey = useVaultStore((state) => state.encryptionKey);
  const isLocked = useVaultStore((state) => state.isLocked);

  return useQuery({
    queryKey: passwordKeys.detail(id),
    queryFn: async (): Promise<DecryptedPasswordEntry | null> => {
      if (!encryptionKey) {
        throw new Error("Vault is locked");
      }

      const response = await fetch(`/api/vault/passwords/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const json = await response.json();
        throw new Error(json.error?.message || "Failed to fetch password");
      }

      const json = await response.json();
      const entry = json.data as PasswordEntry;

      // Decrypt
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
    },
    enabled: !isLocked && !!encryptionKey && !!id,
  });
}

/**
 * Hook to prefetch passwords on hover/focus for faster navigation
 */
export function usePrefetchPasswords() {
  const queryClient = useQueryClient();
  const encryptionKey = useVaultStore((state) => state.encryptionKey);
  const isLocked = useVaultStore((state) => state.isLocked);

  return {
    prefetch: async (filters: PasswordFilters = {}) => {
      if (!encryptionKey || isLocked) return;

      await queryClient.prefetchQuery({
        queryKey: passwordKeys.list(filters),
        queryFn: async (): Promise<DecryptedPasswordEntry[]> => {
          const vault = await fetchVaultData(filters.includeDeleted);

          // Decrypt all passwords in parallel
          const decryptionResults = await Promise.allSettled(
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

          // Filter out failed decryptions
          const decryptedPasswords: DecryptedPasswordEntry[] = [];
          for (const result of decryptionResults) {
            if (result.status === "fulfilled") {
              decryptedPasswords.push(result.value);
            }
          }

          // Apply client-side filters
          let filtered = decryptedPasswords;

          if (!filters.includeDeleted) {
            filtered = filtered.filter((p) => !p.deletedAt);
          }

          if (filters.categoryId) {
            filtered = filtered.filter(
              (p) => p.categoryId === filters.categoryId,
            );
          }

          if (filters.favorite) {
            filtered = filtered.filter((p) => p.favorite);
          }

          if (filters.tag) {
            filtered = filtered.filter((p) => p.tags.includes(filters.tag!));
          }

          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(
              (p) =>
                p.title.toLowerCase().includes(searchLower) ||
                p.username?.toLowerCase().includes(searchLower) ||
                p.url?.toLowerCase().includes(searchLower) ||
                p.notes?.toLowerCase().includes(searchLower),
            );
          }

          return filtered;
        },
        staleTime: 5 * 60 * 1000,
      });
    },
  };
}
