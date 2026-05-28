/**
 * PBKDF2 password hashing via Web Crypto API.
 *
 * Replaces Better Auth's default scrypt which exceeds Cloudflare Workers CPU
 * limits.  Web Crypto PBKDF2 runs natively in V8.
 *
 * Legacy scrypt-hashed passwords (format "hexSalt:hexKey") are verified via
 * Better Auth's scrypt fallback.  Once verified, the user *must* reset their
 * password so a PBKDF2 hash is stored going forward.
 */

import { verifyPassword as scryptVerify } from "@better-auth/utils/password"

const PBKDF2_PREFIX = "$pbkdf2$"
const PBKDF2_ITERATIONS = 100_000
const PBKDF2_HASH = "SHA-256"
const PBKDF2_KEY_LEN_BITS = 256
const SALT_LENGTH = 16

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

// ---------------------------------------------------------------------------
// PBKDF2 (Web Crypto — fast in Workers)
// ---------------------------------------------------------------------------

async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  )
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: bytesToArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    key,
    PBKDF2_KEY_LEN_BITS
  )
  return new Uint8Array(derived)
}

async function pbkdf2Verify(hash: string, password: string): Promise<boolean> {
  const parts = hash.split("$")
  if (parts.length !== 4 || parts[1] !== "pbkdf2") return false

  const salt = base64ToBytes(parts[2])
  const expected = base64ToBytes(parts[3])
  const derived = await deriveKey(password, salt)

  return constantTimeEqual(derived, expected)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const derived = await deriveKey(password, salt)
  return `${PBKDF2_PREFIX}${arrayBufferToBase64(salt)}$${arrayBufferToBase64(derived)}`
}

export async function verifyPassword(data: {
  hash: string
  password: string
}): Promise<boolean> {
  const { hash, password } = data

  // PBKDF2 format: $pbkdf2$<base64-salt>$<base64-hash> (new users)
  if (hash.startsWith(PBKDF2_PREFIX)) {
    return pbkdf2Verify(hash, password)
  }

  // Scrypt format: <hex-salt>:<hex-key> (legacy users)
  // Uses Better Auth's scrypt fallback which may hit CPU limits in Workers.
  // Once verified, the user should reset their password to migrate to PBKDF2.
  if (hash.includes(":") && !hash.startsWith("$")) {
    return scryptVerify(hash, password)
  }

  return false
}
