import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const databaseUrl = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
const database =
  databaseUrl && databaseUrl.trim().length > 0
    ? new Pool({
        allowExitOnIdle: true,
        connectionString: databaseUrl,
        ssl:
          process.env.DATABASE_SSL === "true" ||
          databaseUrl.includes("supabase.co")
            ? { rejectUnauthorized: false }
            : undefined,
      })
    : undefined;
const hasDatabase = Boolean(database);

export const auth = betterAuth({
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
    encryptOAuthTokens: hasDatabase,
    storeAccountCookie: !hasDatabase,
    storeStateStrategy: hasDatabase ? "database" : "cookie",
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
  appName: "CareerMatch",
  baseURL,
  database,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
  secret: process.env.BETTER_AUTH_SECRET,
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
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      prompt: "select_account",
    },
  },
  trustedOrigins: [baseURL],
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
});
