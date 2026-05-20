/**
 * PBKDF2 password hashing via Web Crypto API.
 *
 * Replaces Better Auth's default scrypt (pure-JS) which exceeds Cloudflare
 * Workers CPU limits.  Web Crypto PBKDF2 runs natively in V8 — orders of
 * magnitude faster than pure-JS scrypt.
 *
 * Existing scrypt-hashed passwords (from before this migration) cannot be
 * verified in Workers.  Affected users must reset their password via the
 * forgot-password flow, which stores a PBKDF2 hash going forward.
 */

const PBKDF2_PREFIX = "$pbkdf2$"
const PBKDF2_ITERATIONS = 100_000
const PBKDF2_HASH = "SHA-256"
const PBKDF2_KEY_LEN_BITS = 256
const SALT_LENGTH = 16

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
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

/** Constant-time buffer comparison — prevents timing side-channels. */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

// ---------------------------------------------------------------------------
// Core PBKDF2 operations
// ---------------------------------------------------------------------------

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  )
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    key,
    PBKDF2_KEY_LEN_BITS,
  )
  return new Uint8Array(derived)
}

// ---------------------------------------------------------------------------
// Public API — compatible with Better Auth's password.{hash, verify}
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

  // Only PBKDF2 hashes are supported in Workers.
  // Legacy scrypt hashes cannot be verified — users must reset their password.
  if (!hash.startsWith(PBKDF2_PREFIX)) {
    console.warn(
      "[Auth] Legacy scrypt password hash detected. Verification not supported in Cloudflare Workers.",
    )
    return false
  }

  const parts = hash.split("$")
  // Format: $pbkdf2$<salt>$<hash>
  if (parts.length !== 4 || parts[1] !== "pbkdf2") {
    return false
  }

  const salt = base64ToBytes(parts[2])
  const expected = base64ToBytes(parts[3])
  const derived = await deriveKey(password, salt)

  return constantTimeEqual(derived, expected)
}
