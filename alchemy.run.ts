import alchemy from "alchemy"
import { Assets, Hyperdrive, KVNamespace, Worker } from "alchemy/cloudflare"
import { CloudflareStateStore } from "alchemy/state"

const app = await alchemy("careermatch-capstone", {
  password: requiredEnv("ALCHEMY_PASSWORD"),
  ...(process.env.CI || process.env.ALCHEMY_STATE_TOKEN
    ? {
        stateStore: (scope) =>
          new CloudflareStateStore(scope, {
            scriptName: "careermatch-capstone-alchemy-state",
            stateToken: alchemy.secret(requiredEnv("ALCHEMY_STATE_TOKEN")),
          }),
      }
    : {}),
})

function requiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} must be set before deploying with Alchemy.`)
  }

  return value
}

const databaseUrl =
  process.env.SUPABASE_POOLER_URL || requiredEnv("DATABASE_URL")

const authKv = await KVNamespace("auth-kv", {
  title: `${app.name}-${app.stage}-auth-kv`,
  adopt: true,
})

const hyperdrive = await Hyperdrive("hyperdrive", {
  name: `${app.name}-${app.stage}-hyperdrive`,
  origin: alchemy.secret(databaseUrl),
  caching: {
    disabled: true,
  },
  adopt: true,
})

const assets = await Assets({
  path: ".output/public",
})

export const worker = await Worker("worker", {
  name: process.env.CLOUDFLARE_WORKER_NAME || "careermatch-capstone",
  entrypoint: ".output/server/index.mjs",
  noBundle: true,
  compatibilityDate: "2026-05-16",
  compatibilityFlags: ["nodejs_compat"],
  bindings: {
    ASSETS: assets,
    AUTH_KV: authKv,
    HYPERDRIVE: hyperdrive,
    N8N_WEBHOOK_URL: alchemy.secret(requiredEnv("N8N_WEBHOOK_URL")),
    CHATBOT_URL: alchemy.secret(requiredEnv("CHATBOT_URL")),
    BETTER_AUTH_URL: alchemy.secret(requiredEnv("BETTER_AUTH_URL")),
    BETTER_AUTH_SECRET: alchemy.secret(requiredEnv("BETTER_AUTH_SECRET")),
    GOOGLE_CLIENT_ID: alchemy.secret(requiredEnv("GOOGLE_CLIENT_ID")),
    GOOGLE_CLIENT_SECRET: alchemy.secret(requiredEnv("GOOGLE_CLIENT_SECRET")),
    DATABASE_URL: alchemy.secret(databaseUrl),
    SUPABASE_URL: alchemy.secret(requiredEnv("SUPABASE_URL")),
    SUPABASE_SERVICE_ROLE_KEY: alchemy.secret(
      requiredEnv("SUPABASE_SERVICE_ROLE_KEY")
    ),
    SUPABASE_DB_PASSWORD: alchemy.secret(requiredEnv("SUPABASE_DB_PASSWORD")),
  },
  observability: {
    enabled: true,
    headSamplingRate: 1,
    logs: {
      enabled: true,
      headSamplingRate: 1,
      persist: true,
      invocationLogs: true,
    },
    traces: {
      enabled: true,
      persist: true,
      headSamplingRate: 1,
    },
  },
  rules: [
    {
      globs: ["**/*.mjs", "**/*.js"],
    },
  ],
  dev: {
    port: 3000,
  },
  url: true,
  adopt: true,
})

console.log({
  url: worker.url,
})

await app.finalize()
