import { betterAuth } from "better-auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { Client } from "pg"

// ---------------------------------------------------------------------------
// Minimal KVNamespace interface (avoids depending on @cloudflare/workers-types)
// ---------------------------------------------------------------------------
interface KVNamespace {
  get(
    key: string,
    type?: "text" | "json" | "arrayBuffer" | "stream",
  ): Promise<unknown>
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>
  delete(key: string): Promise<void>
}

// ---------------------------------------------------------------------------
// Runtime env (injected by TanStack Start / Cloudflare Workers adapter)
// ---------------------------------------------------------------------------
type RuntimeEnvGlobal = typeof globalThis & {
  __env__?: {
    BETTER_AUTH_SECRET?: string
    BETTER_AUTH_URL?: string
    DATABASE_URL?: string
    GOOGLE_CLIENT_ID?: string
    GOOGLE_CLIENT_SECRET?: string
    HYPERDRIVE?: {
      connectionString?: string
    }
    SUPABASE_DB_URL?: string
    /** Cloudflare KV namespace for Better Auth secondary storage */
    AUTH_KV?: KVNamespace
  }
}

function getRuntimeHyperdrive() {
  return (globalThis as RuntimeEnvGlobal).__env__?.HYPERDRIVE
}

function getRuntimeKV(): KVNamespace | undefined {
  return (globalThis as RuntimeEnvGlobal).__env__?.AUTH_KV
}

function getRuntimeEnvValue(
  key: keyof NonNullable<RuntimeEnvGlobal["__env__"]>,
) {
  const runtimeValue = (globalThis as RuntimeEnvGlobal).__env__?.[key]

  if (typeof runtimeValue === "string") {
    return runtimeValue
  }

  return process.env[key]
}

// ---------------------------------------------------------------------------
// URL / origin helpers
// ---------------------------------------------------------------------------
function resolveBaseURL() {
  return getRuntimeEnvValue("BETTER_AUTH_URL") ?? "http://localhost:3000"
}

function resolveTrustedOrigins(baseURL: string) {
  return Array.from(
    new Set([
      baseURL,
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ]),
  )
}

function getDatabaseUrl(): string | undefined {
  // Cloudflare Hyperdrive binding — priority 1
  const hyperdrive = getRuntimeHyperdrive()
  if (hyperdrive?.connectionString) {
    return hyperdrive.connectionString
  }

  // Direct env var — priority 2
  return (
    getRuntimeEnvValue("DATABASE_URL") ?? getRuntimeEnvValue("SUPABASE_DB_URL")
  )
}

// ---------------------------------------------------------------------------
// Database adapter — per-query Client via Hyperdrive (NO pg.Pool)
// ---------------------------------------------------------------------------
// pg.Pool is broken in Cloudflare Workers — TCP connections go stale when
// isolates freeze.  Instead we create a fresh Client per query.  Hyperdrive
// maintains warm connections at the edge, so connect() overhead is < 1 ms.
// ---------------------------------------------------------------------------

interface DatabaseAdapter {
  query(text: string, params?: unknown[]): Promise<{
    rows: unknown[]
    rowCount: number
  }>
}

let dbAdapter: DatabaseAdapter | undefined
let dbAdapterKey: string | undefined

function getDatabaseAdapter(): DatabaseAdapter | undefined {
  const connectionString = getDatabaseUrl()

  if (!connectionString || connectionString.trim().length === 0) {
    return undefined
  }

  if (!dbAdapter || dbAdapterKey !== connectionString) {
    dbAdapter = {
      query: async (text: string, params?: unknown[]) => {
        const client = new Client({ connectionString })
        try {
          await client.connect()
          return await client.query(text, params)
        } finally {
          // Fire-and-forget cleanup — Hyperdrive manages the real pool
          client.end().catch(() => {})
        }
      },
    }
    dbAdapterKey = connectionString
  }

  return dbAdapter
}

// ---------------------------------------------------------------------------
// KV → Better Auth secondary storage adapter
// ---------------------------------------------------------------------------
// When secondaryStorage is set, Better Auth stores sessions, rate-limit data,
// and verification tokens in KV instead of Postgres.  This eliminates DB writes
// on every sign-in, reducing CPU time.
// ---------------------------------------------------------------------------

function createKVStorage(kv: KVNamespace) {
  return {
    get: async (key: string) => {
      return kv.get(key, "json")
    },
    set: async (key: string, value: unknown, ttl?: number) => {
      await kv.put(key, JSON.stringify(value), {
        expirationTtl: ttl,
      })
    },
    delete: async (key: string) => {
      await kv.delete(key)
    },
  }
}

// ---------------------------------------------------------------------------
// Runtime config
// ---------------------------------------------------------------------------
type AuthRuntimeConfig = {
  baseURL: string
  googleClientId: string
  googleClientSecret: string
  secret?: string
  trustedOrigins: string[]
}

function resolveAuthRuntimeConfig(): AuthRuntimeConfig {
  const baseURL = resolveBaseURL()

  return {
    baseURL,
    googleClientId: getRuntimeEnvValue("GOOGLE_CLIENT_ID") ?? "",
    googleClientSecret: getRuntimeEnvValue("GOOGLE_CLIENT_SECRET") ?? "",
    secret: getRuntimeEnvValue("BETTER_AUTH_SECRET"),
    trustedOrigins: resolveTrustedOrigins(baseURL),
  }
}

// ---------------------------------------------------------------------------
// Auth instance factory
// ---------------------------------------------------------------------------
function createAuthInstance(
  database: DatabaseAdapter | undefined,
  kv: KVNamespace | undefined,
) {
  const hasDatabase = Boolean(database)
  const runtimeConfig = resolveAuthRuntimeConfig()

  return betterAuth({
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
      encryptOAuthTokens: hasDatabase,
      storeAccountCookie: !hasDatabase,
      storeStateStrategy: "cookie",
      fields: {
        accessToken: "access_token",
        accessTokenExpiresAt: "access_token_expires_at",
        accountId: "account_id",
        createdAt: "created_at",
        idToken: "id_token",
        providerId: "provider_id",
        refreshToken: "refresh_token",
        refreshTokenExpiresAt: "refresh_token_expires_at",
        updatedAt: "updated_at",
        userId: "user_id",
      },
      modelName: "accounts",
    },
    advanced: {
      useSecureCookies: runtimeConfig.baseURL.startsWith("https://"),
    },
    appName: "CareerMatch",
    baseURL: runtimeConfig.baseURL,
    database,
    emailAndPassword: {
      enabled: true,
    },
    plugins: [tanstackStartCookies()],
    secondaryStorage: kv ? createKVStorage(kv) : undefined,
    secret: runtimeConfig.secret,
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 7,
        // "compact" uses Base64 + HMAC — far less CPU than "jwe" encryption.
        // "jwe" encrypts the entire session payload which is expensive in
        // Cloudflare Workers (pure-JS crypto, no native bindings).
        strategy: "compact",
      },
      fields: {
        createdAt: "created_at",
        expiresAt: "expires_at",
        ipAddress: "ip_address",
        updatedAt: "updated_at",
        userAgent: "user_agent",
        userId: "user_id",
      },
      modelName: "sessions",
      // When KV secondary storage is available, sessions live in KV.
      // Only store in Postgres when there's no KV fallback.
      storeSessionInDatabase: hasDatabase && !kv,
    },
    socialProviders: {
      google: {
        clientId: runtimeConfig.googleClientId,
        clientSecret: runtimeConfig.googleClientSecret,
        prompt: "select_account",
      },
    },
    trustedOrigins: runtimeConfig.trustedOrigins,
    user: {
      additionalFields: {
        role: {
          defaultValue: "jobseeker",
          input: false,
          required: false,
          type: "string",
        },
        status: {
          defaultValue: "active",
          input: false,
          required: false,
          type: "string",
        },
        companyId: {
          fieldName: "company_id",
          input: false,
          required: false,
          type: "string",
        },
      },
      fields: {
        createdAt: "created_at",
        emailVerified: "email_verified",
        image: "avatar_url",
        updatedAt: "updated_at",
      },
      modelName: "users",
    },
    verification: {
      fields: {
        createdAt: "created_at",
        expiresAt: "expires_at",
        updatedAt: "updated_at",
      },
      modelName: "verifications",
      storeInDatabase: hasDatabase,
    },
  })
}

// ---------------------------------------------------------------------------
// Cached auth instance (re-created when config changes)
// ---------------------------------------------------------------------------
type AuthInstance = ReturnType<typeof createAuthInstance>
let authCache: { auth: AuthInstance; key: string } | undefined

function getAuthInstance() {
  const database = getDatabaseAdapter()
  const kv = getRuntimeKV()
  const runtimeConfig = resolveAuthRuntimeConfig()
  const cacheKey = JSON.stringify({
    baseURL: runtimeConfig.baseURL,
    databaseUrl: dbAdapterKey ?? null,
    googleClientId: runtimeConfig.googleClientId,
    hasDatabase: Boolean(database),
    hasKV: Boolean(kv),
    secret: Boolean(runtimeConfig.secret),
  })

  if (!authCache || authCache.key !== cacheKey) {
    authCache = {
      auth: createAuthInstance(database, kv),
      key: cacheKey,
    }
  }

  return authCache.auth
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function withAuth<T>(
  callback: (auth: AuthInstance) => Promise<T>,
): Promise<T> {
  const auth = getAuthInstance()
  return callback(auth)
}
