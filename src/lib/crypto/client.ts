/**
 * Client-Side Cryptography Utilities
 * Handles all encryption/decryption operations using Web Crypto API
 * This file is meant to run in the browser only
 */

// ============================================================================
// Types
// ============================================================================

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  version: number;
}

export interface DerivedKeys {
  authKey: CryptoKey;
  encryptionKey: CryptoKey;
  authHash: string;
}

// ============================================================================
// Constants
// ============================================================================

const ENCRYPTION_ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const PBKDF2_ITERATIONS = 600000; // OWASP 2023 recommendation
const CURRENT_VERSION = 1;

// ============================================================================
// Key Derivation
// ============================================================================

/**
 * Derive encryption and authentication keys from master password
 * Uses PBKDF2 with different salts to create separate keys
 */
export async function deriveKeys(
  masterPassword: string,
  salt: string,
): Promise<DerivedKeys> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(masterPassword);
  const saltBuffer = encoder.encode(salt);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );

  // Derive authentication key (for server verification)
  const authSalt = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(salt + ":auth"),
  );

  const authKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(authSalt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "HMAC", hash: "SHA-256", length: KEY_LENGTH },
    true,
    ["sign"],
  );

  // Derive encryption key (for vault encryption)
  const encSalt = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(salt + ":enc"),
  );

  const encryptionKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(encSalt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"],
  );

  // Generate auth hash (this is what gets sent to the server)
  const authHashBuffer = await crypto.subtle.sign("HMAC", authKey, saltBuffer);
  const authHash = arrayBufferToHex(authHashBuffer);

  return {
    authKey,
    encryptionKey,
    authHash,
  };
}

/**
 * Derive only the auth hash (for login without decrypting vault)
 */
export async function deriveAuthHash(
  masterPassword: string,
  salt: string,
): Promise<string> {
  const keys = await deriveKeys(masterPassword, salt);
  return keys.authHash;
}

// ============================================================================
// Encryption / Decryption
// ============================================================================

/**
 * Encrypt data using AES-256-GCM
 */
export async function encrypt(
  plaintext: string,
  key: CryptoKey,
): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv,
    },
    key,
    data,
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer),
    version: CURRENT_VERSION,
  };
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decrypt(
  encryptedData: EncryptedData,
  key: CryptoKey,
): Promise<string> {
  const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
  const iv = base64ToArrayBuffer(encryptedData.iv);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: new Uint8Array(iv),
    },
    key,
    ciphertext,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Encrypt an object (serializes to JSON first)
 */
export async function encryptObject<T>(
  obj: T,
  key: CryptoKey,
): Promise<EncryptedData> {
  const json = JSON.stringify(obj);
  return encrypt(json, key);
}

/**
 * Decrypt to an object (parses JSON after decryption)
 */
export async function decryptObject<T>(
  encryptedData: EncryptedData,
  key: CryptoKey,
): Promise<T> {
  const json = await decrypt(encryptedData, key);
  return JSON.parse(json) as T;
}

// ============================================================================
// Vault Key Management
// ============================================================================

/**
 * Generate a random vault key
 */
export async function generateVaultKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"],
  );
}

/**
 * Export vault key for storage (encrypted with auth key)
 */
export async function exportVaultKey(
  vaultKey: CryptoKey,
  encryptionKey: CryptoKey,
): Promise<string> {
  const rawKey = await crypto.subtle.exportKey("raw", vaultKey);
  const keyString = arrayBufferToBase64(rawKey);
  const encrypted = await encrypt(keyString, encryptionKey);
  return JSON.stringify(encrypted);
}

/**
 * Import vault key from storage (decrypted with auth key)
 */
export async function importVaultKey(
  encryptedVaultKey: string,
  encryptionKey: CryptoKey,
): Promise<CryptoKey> {
  const encryptedData = JSON.parse(encryptedVaultKey) as EncryptedData;
  const keyString = await decrypt(encryptedData, encryptionKey);
  const rawKey = base64ToArrayBuffer(keyString);

  return crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"],
  );
}

// ============================================================================
// Password Strength Analysis
// ============================================================================

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  entropy: number;
  crackTime: string;
  feedback: string[];
  warning?: string;
}

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(
  password: string,
): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  // Length scoring
  const length = password.length;
  if (length < 8) {
    feedback.push("Use at least 8 characters");
  } else if (length < 12) {
    score += 1;
    feedback.push("Consider using 12+ characters for better security");
  } else if (length < 16) {
    score += 2;
  } else {
    score += 3;
  }

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(
    Boolean,
  ).length;

  if (!hasLower) feedback.push("Add lowercase letters");
  if (!hasUpper) feedback.push("Add uppercase letters");
  if (!hasNumber) feedback.push("Add numbers");
  if (!hasSpecial) feedback.push("Add special characters");

  score += varietyCount;

  // Common patterns (deductions)
  const commonPatterns = [
    /^123/,
    /321$/,
    /abc/i,
    /qwerty/i,
    /password/i,
    /(.)\1{2,}/, // Repeated characters
    /^[a-z]+$/i, // Only letters
    /^[0-9]+$/, // Only numbers
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push("Avoid common patterns");
      break;
    }
  }

  // Calculate entropy
  let charsetSize = 0;
  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasNumber) charsetSize += 10;
  if (hasSpecial) charsetSize += 32;

  const entropy = length * Math.log2(charsetSize || 1);

  // Normalize score to 0-4
  const normalizedScore = Math.min(4, Math.max(0, Math.floor(score / 2))) as
    | 0
    | 1
    | 2
    | 3
    | 4;

  // Estimate crack time
  const crackTime = estimateCrackTime(entropy);

  // Generate warning
  let warning: string | undefined;
  if (normalizedScore === 0) {
    warning = "This password is very weak and easily guessable";
  } else if (normalizedScore === 1) {
    warning = "This password could be cracked quickly";
  }

  return {
    score: normalizedScore,
    entropy: Math.round(entropy),
    crackTime,
    feedback: feedback.slice(0, 3), // Limit to 3 suggestions
    warning,
  };
}

function estimateCrackTime(entropy: number): string {
  // Assume 10 billion guesses per second (modern GPU cluster)
  const guessesPerSecond = 10_000_000_000;
  const totalGuesses = Math.pow(2, entropy);
  const seconds = totalGuesses / guessesPerSecond / 2; // Average case

  if (seconds < 1) return "instantly";
  if (seconds < 60) return "seconds";
  if (seconds < 3600) return "minutes";
  if (seconds < 86400) return "hours";
  if (seconds < 2592000) return "days";
  if (seconds < 31536000) return "months";
  if (seconds < 3153600000) return "years";
  if (seconds < 3153600000000) return "centuries";
  return "millennia+";
}

// ============================================================================
// Password Generator
// ============================================================================

export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  excludeCharacters: string;
}

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:'\",.<>?/",
  ambiguous: "O0Il1",
};

/**
 * Generate a secure random password
 */
export function generatePassword(options: GeneratorOptions): string {
  let charset = "";
  const required: string[] = [];

  if (options.uppercase) {
    let chars = CHAR_SETS.uppercase;
    if (options.excludeAmbiguous) {
      chars = chars.replace(/[OI]/g, "");
    }
    charset += chars;
    required.push(chars);
  }

  if (options.lowercase) {
    let chars = CHAR_SETS.lowercase;
    if (options.excludeAmbiguous) {
      chars = chars.replace(/[l]/g, "");
    }
    charset += chars;
    required.push(chars);
  }

  if (options.numbers) {
    let chars = CHAR_SETS.numbers;
    if (options.excludeAmbiguous) {
      chars = chars.replace(/[01]/g, "");
    }
    charset += chars;
    required.push(chars);
  }

  if (options.symbols) {
    charset += CHAR_SETS.symbols;
    required.push(CHAR_SETS.symbols);
  }

  // Remove excluded characters
  if (options.excludeCharacters) {
    for (const char of options.excludeCharacters) {
      charset = charset.replace(new RegExp(escapeRegex(char), "g"), "");
    }
  }

  if (charset.length === 0) {
    throw new Error("No characters available for password generation");
  }

  // Generate password
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  let password = "";
  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }

  // Ensure at least one character from each required set
  const passwordArray = password.split("");
  for (let i = 0; i < required.length && i < options.length; i++) {
    const charSet = required[i];
    const randomIndex = array[i] % charSet.length;
    const position = array[i] % options.length;
    passwordArray[position] = charSet[randomIndex];
  }

  // Shuffle the password
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = array[i] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join("");
}

/**
 * Generate a memorable passphrase
 */
export function generatePassphrase(
  wordCount: number = 4,
  separator: string = "-",
  capitalize: boolean = true,
  includeNumber: boolean = true,
): string {
  // Common word list (subset for example)
  const words = [
    "correct",
    "horse",
    "battery",
    "staple",
    "cloud",
    "mountain",
    "river",
    "forest",
    "ocean",
    "sunset",
    "thunder",
    "garden",
    "castle",
    "dragon",
    "phoenix",
    "crystal",
    "shadow",
    "spirit",
    "wizard",
    "knight",
    "arrow",
    "bridge",
    "canyon",
    "desert",
    "eagle",
    "falcon",
    "glacier",
    "harbor",
    "island",
    "jungle",
    "kingdom",
    "lantern",
    "meadow",
    "nebula",
    "oracle",
    "palace",
    "quartz",
    "rainbow",
    "sapphire",
    "temple",
    "unicorn",
    "valley",
    "waterfall",
    "xenon",
    "yellow",
    "zephyr",
    "anchor",
    "beacon",
    "compass",
  ];

  const array = new Uint32Array(wordCount + 1);
  crypto.getRandomValues(array);

  const selectedWords: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    let word = words[array[i] % words.length];
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    selectedWords.push(word);
  }

  let passphrase = selectedWords.join(separator);

  if (includeNumber) {
    const number = (array[wordCount] % 100).toString();
    passphrase += separator + number;
  }

  return passphrase;
}

// ============================================================================
// Utility Functions
// ============================================================================

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
