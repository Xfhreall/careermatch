import { betterAuth } from "better-auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { Pool } from "pg"

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
  }
}

function getRuntimeHyperdrive() {
  return (globalThis as RuntimeEnvGlobal).__env__?.HYPERDRIVE
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
    ])
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

let pool: Pool | undefined
let poolKey: string | undefined

function getDatabasePool(): Pool | undefined {
  const databaseUrl = getDatabaseUrl()

  if (!databaseUrl || databaseUrl.trim().length === 0) {
    return undefined
  }

  if (!pool || poolKey !== databaseUrl) {
    const isHyperdrive = Boolean(getRuntimeHyperdrive())

    pool = new Pool({
      connectionString: databaseUrl,
      max: isHyperdrive ? 1 : 2,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
      // Hyperdrive handles SSL internally; only set SSL for direct connections
      ssl: isHyperdrive ? undefined : { rejectUnauthorized: false },
    })
    poolKey = databaseUrl

    pool.on("error", (err) => {
      console.error("[DB Pool] Unexpected error:", err.message)
    })
  }

  return pool
}

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

function createAuthInstance(database?: Pool) {
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
    secret: runtimeConfig.secret,
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 7,
        strategy: "jwe",
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
      storeSessionInDatabase: hasDatabase,
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

function getAuthInstance() {
  const database = getDatabasePool()
  const runtimeConfig = resolveAuthRuntimeConfig()
  const cacheKey = JSON.stringify({
    baseURL: runtimeConfig.baseURL,
    databaseUrl: poolKey ?? null,
    googleClientId: runtimeConfig.googleClientId,
    hasDatabase: Boolean(database),
    secret: Boolean(runtimeConfig.secret),
  })

  if (!authCache || authCache.key !== cacheKey) {
    authCache = {
      auth: createAuthInstance(database),
      key: cacheKey,
    }
  }

  return authCache.auth
}

export async function withAuth<T>(
  callback: (auth: AuthInstance) => Promise<T>
): Promise<T> {
  const auth = getAuthInstance()
  return callback(auth)
}
