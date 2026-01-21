"use client";

import { useCallback, useMemo } from "react";
import { useVaultStore, type DecryptedPasswordEntry } from "@/stores";
import {
  generatePassword,
  generatePassphrase,
  calculatePasswordStrength,
} from "@/lib/crypto/client";

interface UsePasswordsReturn {
  // State
  passwords: DecryptedPasswordEntry[];
  favorites: DecryptedPasswordEntry[];
  trash: DecryptedPasswordEntry[];
  isLoading: boolean;
  error: string | null;

  // CRUD operations
  addPassword: (entry: NewPasswordEntry) => Promise<string | null>;
  updatePassword: (
    id: string,
    updates: Partial<DecryptedPasswordEntry>,
  ) => Promise<boolean>;
  deletePassword: (id: string, permanent?: boolean) => Promise<boolean>;
  restorePassword: (id: string) => Promise<boolean>;

  // Queries
  getById: (id: string) => DecryptedPasswordEntry | undefined;
  getByCategory: (categoryId: string) => DecryptedPasswordEntry[];
  search: (query: string) => DecryptedPasswordEntry[];

  // Password generation
  generateSecurePassword: (options?: PasswordGenerationOptions) => string;
  generateSecurePassphrase: (options?: PassphraseOptions) => string;
  analyzeStrength: (password: string) => PasswordStrengthResult;
}

interface NewPasswordEntry {
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

interface PasswordGenerationOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeAmbiguous?: boolean;
  excludeCharacters?: string;
}

interface PassphraseOptions {
  wordCount?: number;
  separator?: string;
  capitalize?: boolean;
  includeNumber?: boolean;
}

interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  feedback: string[];
  entropy: number;
  crackTime: string;
}

/**
 * Check if a password is reused
 */
function checkForReuse(
  password: string,
  existing: DecryptedPasswordEntry[],
): boolean {
  // In a real implementation, we'd compare hashes rather than plaintext
  // For now, just check if the exact password exists
  return existing.some((p) => p.password === password && !p.deletedAt);
}

export function usePasswords(): UsePasswordsReturn {
  const store = useVaultStore();

  // Memoized password lists
  const passwords = useMemo(
    () => store.passwords.filter((p) => !p.deletedAt),
    [store.passwords],
  );

  const favorites = useMemo(
    () => store.passwords.filter((p) => p.favorite && !p.deletedAt),
    [store.passwords],
  );

  const trash = useMemo(
    () => store.passwords.filter((p) => !!p.deletedAt),
    [store.passwords],
  );

  /**
   * Add a new password entry
   */
  const addPassword = useCallback(
    async (entry: NewPasswordEntry): Promise<string | null> => {
      const strength = calculatePasswordStrength(entry.password);

      const fullEntry = {
        ...entry,
        tags: entry.tags || [],
        favorite: entry.favorite || false,
        passwordStrength: strength.score as 0 | 1 | 2 | 3 | 4,
        isCompromised: false,
        isReused: checkForReuse(entry.password, store.passwords),
      };

      return store.addPassword(fullEntry);
    },
    [store],
  );

  /**
   * Update a password entry
   */
  const updatePassword = useCallback(
    async (
      id: string,
      updates: Partial<DecryptedPasswordEntry>,
    ): Promise<boolean> => {
      // Recalculate strength if password changed
      if (updates.password) {
        const strength = calculatePasswordStrength(updates.password);
        updates.passwordStrength = strength.score as 0 | 1 | 2 | 3 | 4;
        updates.isReused = checkForReuse(
          updates.password,
          store.passwords.filter((p) => p._id !== id),
        );
      }

      return store.updatePassword(id, updates);
    },
    [store],
  );

  /**
   * Delete a password (soft delete by default)
   */
  const deletePassword = useCallback(
    async (id: string, permanent = false): Promise<boolean> => {
      return store.deletePassword(id, permanent);
    },
    [store],
  );

  /**
   * Restore a password from trash
   */
  const restorePassword = useCallback(
    async (id: string): Promise<boolean> => {
      return store.restorePassword(id);
    },
    [store],
  );

  /**
   * Get password by ID
   */
  const getById = useCallback(
    (id: string): DecryptedPasswordEntry | undefined => {
      return store.getPasswordById(id);
    },
    [store],
  );

  /**
   * Get passwords by category
   */
  const getByCategory = useCallback(
    (categoryId: string): DecryptedPasswordEntry[] => {
      return store.getPasswordsByCategory(categoryId);
    },
    [store],
  );

  /**
   * Search passwords
   */
  const search = useCallback(
    (query: string): DecryptedPasswordEntry[] => {
      return store.searchPasswords(query);
    },
    [store],
  );

  /**
   * Generate a secure random password
   */
  const generateSecurePassword = useCallback(
    (options: PasswordGenerationOptions = {}): string => {
      return generatePassword({
        length: options.length || 20,
        uppercase: options.includeUppercase ?? true,
        lowercase: options.includeLowercase ?? true,
        numbers: options.includeNumbers ?? true,
        symbols: options.includeSymbols ?? true,
        excludeAmbiguous: options.excludeAmbiguous ?? false,
        excludeCharacters: options.excludeCharacters ?? "",
      });
    },
    [],
  );

  /**
   * Generate a secure passphrase
   */
  const generateSecurePassphrase = useCallback(
    (options: PassphraseOptions = {}): string => {
      return generatePassphrase(
        options.wordCount || 4,
        options.separator || "-",
        options.capitalize ?? true,
        options.includeNumber ?? true,
      );
    },
    [],
  );

  /**
   * Analyze password strength
   */
  const analyzeStrength = useCallback(
    (password: string): PasswordStrengthResult => {
      const result = calculatePasswordStrength(password);

      const labels: Record<number, PasswordStrengthResult["label"]> = {
        0: "Very Weak",
        1: "Weak",
        2: "Fair",
        3: "Strong",
        4: "Very Strong",
      };

      // Estimate crack time based on entropy
      const crackTime = estimateCrackTime(result.entropy);

      return {
        score: result.score as 0 | 1 | 2 | 3 | 4,
        label: labels[result.score],
        feedback: result.feedback,
        entropy: result.entropy,
        crackTime,
      };
    },
    [],
  );

  return {
    passwords,
    favorites,
    trash,
    isLoading: store.isLoading,
    error: store.error,
    addPassword,
    updatePassword,
    deletePassword,
    restorePassword,
    getById,
    getByCategory,
    search,
    generateSecurePassword,
    generateSecurePassphrase,
    analyzeStrength,
  };
}

/**
 * Estimate how long it would take to crack a password based on entropy
 */
function estimateCrackTime(entropy: number): string {
  // Assuming 10 billion guesses per second (modern GPU attack)
  const guessesPerSecond = 10_000_000_000;
  const totalGuesses = Math.pow(2, entropy);
  const seconds = totalGuesses / guessesPerSecond / 2; // Average case

  if (seconds < 1) return "Instant";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 100)
    return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1000000)
    return `${Math.round(seconds / 31536000 / 1000)} thousand years`;
  if (seconds < 31536000 * 1000000000)
    return `${Math.round(seconds / 31536000 / 1000000)} million years`;
  return "Billions of years";
}
