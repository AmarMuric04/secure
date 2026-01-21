/**
 * Server-Side Cryptography Utilities
 * Handles password hashing and token operations
 */

import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from "jose";
import { v4 as uuidv4 } from "uuid";
import type { JWTPayload, MfaTokenPayload } from "@/types";

// ============================================================================
// Environment Configuration
// ============================================================================

function getJwtSecretKey(): Uint8Array {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined in environment variables");
  }
  return new TextEncoder().encode(JWT_SECRET);
}

function getRefreshSecretKey(): Uint8Array {
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  if (!JWT_REFRESH_SECRET) {
    throw new Error(
      "JWT_REFRESH_SECRET must be defined in environment variables",
    );
  }
  return new TextEncoder().encode(JWT_REFRESH_SECRET);
}

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const MFA_TOKEN_EXPIRY = "5m";

// ============================================================================
// Password Hashing (for server-side auth hash verification)
// ============================================================================

const SALT_ROUNDS = 12;

/**
 * Hash the auth hash received from client with bcrypt
 * This adds an additional layer of security on top of client-side hashing
 */
export async function hashAuthHash(authHash: string): Promise<string> {
  return hash(authHash, SALT_ROUNDS);
}

/**
 * Verify client's auth hash against stored bcrypt hash
 */
export async function verifyAuthHash(
  authHash: string,
  storedHash: string,
): Promise<boolean> {
  return compare(authHash, storedHash);
}

/**
 * Hash a string (for recovery keys, backup codes, etc.)
 */
export async function hashString(value: string): Promise<string> {
  return hash(value, SALT_ROUNDS);
}

/**
 * Verify a string against its hash
 */
export async function verifyString(
  value: string,
  hashedValue: string,
): Promise<boolean> {
  return compare(value, hashedValue);
}

// ============================================================================
// JWT Token Management
// ============================================================================

/**
 * Generate access token
 */
export async function generateAccessToken(
  userId: string,
  email: string,
): Promise<string> {
  return new SignJWT({
    sub: userId,
    email,
    type: "access",
  } as JWTPayload & JoseJWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(getJwtSecretKey());
}

/**
 * Generate refresh token
 */
export async function generateRefreshToken(
  userId: string,
  email: string,
): Promise<string> {
  return new SignJWT({
    sub: userId,
    email,
    type: "refresh",
  } as JWTPayload & JoseJWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(getRefreshSecretKey());
}

/**
 * Generate MFA verification token (short-lived)
 */
export async function generateMfaToken(
  userId: string,
  email: string,
): Promise<string> {
  return new SignJWT({
    sub: userId,
    email,
    type: "mfa",
  } as MfaTokenPayload & JoseJWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(MFA_TOKEN_EXPIRY)
    .sign(getJwtSecretKey());
}

/**
 * Verify access token
 */
export async function verifyAccessToken(
  token: string,
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());

    if (payload.type !== "access") {
      return null;
    }

    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(
  token: string,
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecretKey());

    if (payload.type !== "refresh") {
      return null;
    }

    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Verify MFA token
 */
export async function verifyMfaToken(
  token: string,
): Promise<MfaTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());

    if (payload.type !== "mfa") {
      return null;
    }

    return payload as unknown as MfaTokenPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// Token Utilities
// ============================================================================

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * Generate a recovery key (human-readable format)
 */
export function generateRecoveryKey(): string {
  const segments: string[] = [];
  for (let i = 0; i < 8; i++) {
    const segment = generateSecureToken(3).toUpperCase();
    segments.push(segment);
  }
  return segments.join("-");
}

/**
 * Generate backup codes for MFA
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = generateSecureToken(4).toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Generate UUID v4
 */
export function generateId(): string {
  return uuidv4();
}

// ============================================================================
// TOTP (Time-based One-Time Password) Utilities
// ============================================================================

/**
 * Generate TOTP secret
 */
export function generateTotpSecret(): string {
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);
  return base32Encode(array);
}

/**
 * Verify TOTP code
 */
export function verifyTotpCode(
  secret: string,
  code: string,
  window: number = 1,
): boolean {
  const time = Math.floor(Date.now() / 1000 / 30);

  for (let i = -window; i <= window; i++) {
    const expectedCode = generateTotpCode(secret, time + i);
    if (expectedCode === code) {
      return true;
    }
  }

  return false;
}

/**
 * Generate TOTP code for a given time step
 */
function generateTotpCode(secret: string, timeStep: number): string {
  const key = base32Decode(secret);
  const time = Buffer.alloc(8);
  time.writeBigInt64BE(BigInt(timeStep));

  // HMAC-SHA1
  const hmac = hmacSha1(key, time);

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, "0");
}

// Simple HMAC-SHA1 implementation for TOTP
function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  const keyBuffer = new Uint8Array(blockSize);

  if (key.length > blockSize) {
    // Hash the key if it's too long
    const hashedKey = sha1(key);
    keyBuffer.set(hashedKey);
  } else {
    keyBuffer.set(key);
  }

  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);

  for (let i = 0; i < blockSize; i++) {
    ipad[i] = keyBuffer[i] ^ 0x36;
    opad[i] = keyBuffer[i] ^ 0x5c;
  }

  const inner = new Uint8Array(ipad.length + message.length);
  inner.set(ipad);
  inner.set(message, ipad.length);
  const innerHash = sha1(inner);

  const outer = new Uint8Array(opad.length + innerHash.length);
  outer.set(opad);
  outer.set(innerHash, opad.length);

  return sha1(outer);
}

// Simple SHA1 implementation for TOTP
function sha1(message: Uint8Array): Uint8Array {
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const ml = message.length * 8;
  const padded = new Uint8Array(Math.ceil((message.length + 9) / 64) * 64);
  padded.set(message);
  padded[message.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, ml, false);

  for (let i = 0; i < padded.length; i += 64) {
    const w = new Uint32Array(80);
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 80; j++) {
      w[j] = rotl(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
    }

    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4;

    for (let j = 0; j < 80; j++) {
      let f: number, k: number;
      if (j < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (rotl(a, 5) + f + e + k + w[j]) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const result = new Uint8Array(20);
  const resultView = new DataView(result.buffer);
  resultView.setUint32(0, h0, false);
  resultView.setUint32(4, h1, false);
  resultView.setUint32(8, h2, false);
  resultView.setUint32(12, h3, false);
  resultView.setUint32(16, h4, false);

  return result;
}

function rotl(n: number, b: number): number {
  return ((n << b) | (n >>> (32 - b))) >>> 0;
}

// Base32 encoding/decoding for TOTP secrets
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(data: Uint8Array): string {
  let result = "";
  let bits = 0;
  let value = 0;

  for (const byte of data) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      result += BASE32_ALPHABET[(value >>> bits) & 0x1f];
    }
  }

  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }

  return result;
}

function base32Decode(encoded: string): Uint8Array {
  const cleaned = encoded.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const result: number[] = [];
  let bits = 0;
  let value = 0;

  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      result.push((value >>> bits) & 0xff);
    }
  }

  return new Uint8Array(result);
}

// ============================================================================
// Salt Generation
// ============================================================================

/**
 * Generate a salt for client-side key derivation
 */
export function generateSalt(): string {
  return generateSecureToken(32);
}
