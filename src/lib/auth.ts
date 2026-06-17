import { betterAuth } from "better-auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { Pool } from "pg"

import { hashPassword, verifyPassword } from "@/lib/password"
import { resolveAuthBaseURL, resolveTrustedOrigins } from "@/lib/runtime-origin"

/** Minimal KVNamespace — avoids depending on @cloudflare/workers-types */
interface KVNamespace {
  get(
    key: string,
    type?: "text" | "json" | "arrayBuffer" | "stream"
  ): Promise<unknown>
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>
  delete(key: string): Promise<void>
}

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
  key: keyof NonNullable<RuntimeEnvGlobal["__env__"]>
) {
  const runtimeValue = (globalThis as RuntimeEnvGlobal).__env__?.[key]

  if (typeof runtimeValue === "string") {
    return runtimeValue
  }

  return process.env[key]
}

function getDatabaseUrl(): string | undefined {
  const hyperdrive = getRuntimeHyperdrive()
  if (hyperdrive?.connectionString) {
    return hyperdrive.connectionString
  }

  return (
    getRuntimeEnvValue("DATABASE_URL") ?? getRuntimeEnvValue("SUPABASE_DB_URL")
  )
}

let pool: Pool | undefined
let poolKey: string | undefined

function getDatabasePool(): Pool | undefined {
  const databaseUrl = getDatabaseUrl()

  if (!databaseUrl || databaseUrl.trim().length === 0) {
    return undefined
  }

  const isHyperdrive = Boolean(getRuntimeHyperdrive())

  if (isHyperdrive) {
    // Cloudflare Workers: isolates freeze → pg.Pool TCP connections go stale.
    // Recreate the pool on every request.  Hyperdrive maintains warm edge
    // connections, so connect() overhead is < 1 ms.
    if (pool) {
      pool.end().catch(() => {})
    }
    pool = new Pool({
      connectionString: databaseUrl,
      max: 1,
      idleTimeoutMillis: 5_000,
      connectionTimeoutMillis: 5_000,
    })
    pool.on("error", (err) => {
      console.error("[DB Pool] Unexpected error:", err.message)
    })
    poolKey = databaseUrl
    return pool
  }

  if (!pool || poolKey !== databaseUrl) {
    pool = new Pool({
      connectionString: databaseUrl,
      max: 2,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
      ssl: { rejectUnauthorized: false },
    })
    poolKey = databaseUrl

    pool.on("error", (err) => {
      console.error("[DB Pool] Unexpected error:", err.message)
    })
  }

  return pool
}

function createKVStorage(kv: KVNamespace) {
  return {
    get: async (key: string) => {
      return kv.get(key, "json")
    },
    set: async (key: string, value: unknown, ttl?: number) => {
      // Cloudflare KV requires expirationTtl to be at least 60 seconds.
      const resolvedTtl = ttl !== undefined ? Math.max(ttl, 60) : undefined
      await kv.put(key, JSON.stringify(value), {
        expirationTtl: resolvedTtl,
      })
    },
    delete: async (key: string) => {
      await kv.delete(key)
    },
  }
}

type AuthRuntimeConfig = {
  baseURL: string
  googleClientId: string
  googleClientSecret: string
  secret?: string
  trustedOrigins: string[]
}

function resolveAuthRuntimeConfig(request?: Request): AuthRuntimeConfig {
  const configuredBaseURL = getRuntimeEnvValue("BETTER_AUTH_URL")
  const baseURL = resolveAuthBaseURL({
    configuredBaseURL,
    requestUrl: request?.url,
  })

  return {
    baseURL,
    googleClientId: getRuntimeEnvValue("GOOGLE_CLIENT_ID") ?? "",
    googleClientSecret: getRuntimeEnvValue("GOOGLE_CLIENT_SECRET") ?? "",
    secret: getRuntimeEnvValue("BETTER_AUTH_SECRET"),
    trustedOrigins: resolveTrustedOrigins({
      configuredBaseURL,
      requestUrl: request?.url,
    }),
  }
}

function createAuthInstance(
  database?: Pool,
  kv?: KVNamespace,
  request?: Request
) {
  const hasDatabase = Boolean(database)
  const runtimeConfig = resolveAuthRuntimeConfig(request)

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
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip", "x-real-ip"],
      },
    },
    appName: "CareerMatch",
    baseURL: runtimeConfig.baseURL,
    database,
    emailAndPassword: {
      enabled: true,
      password: {
        hash: hashPassword,
        verify: verifyPassword,
      },
    },
    plugins: [tanstackStartCookies()],
    secondaryStorage: kv ? createKVStorage(kv) : undefined,
    secret: runtimeConfig.secret,
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 7,
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

type AuthInstance = ReturnType<typeof createAuthInstance>
let authCache: { auth: AuthInstance; key: string } | undefined

function getAuthInstance(request?: Request) {
  const database = getDatabasePool()
  const kv = getRuntimeKV()
  const runtimeConfig = resolveAuthRuntimeConfig(request)
  const isHyperdrive = Boolean(getRuntimeHyperdrive())

  // With Hyperdrive, the pool is recreated each request (to avoid stale
  // TCP connections from frozen Worker isolates).  Don't cache the auth
  // instance — it holds a reference to the now-defunct pool.
  if (isHyperdrive) {
    return createAuthInstance(database, kv, request)
  }

  const cacheKey = JSON.stringify({
    baseURL: runtimeConfig.baseURL,
    databaseUrl: poolKey ?? null,
    googleClientId: runtimeConfig.googleClientId,
    hasDatabase: Boolean(database),
    hasKV: Boolean(kv),
    secret: Boolean(runtimeConfig.secret),
  })

  if (!authCache || authCache.key !== cacheKey) {
    authCache = {
      auth: createAuthInstance(database, kv, request),
      key: cacheKey,
    }
  }

  return authCache.auth
}

export async function withAuth<T>(
  callback: (auth: AuthInstance) => Promise<T>,
  request?: Request
): Promise<T> {
  const auth = getAuthInstance(request)
  return callback(auth)
}
