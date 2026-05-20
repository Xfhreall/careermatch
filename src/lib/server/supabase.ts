import { createClient, type SupabaseClient } from "@supabase/supabase-js"

type RuntimeEnvGlobal = typeof globalThis & {
  __env__?: {
    SUPABASE_URL?: string
    SUPABASE_SERVICE_ROLE_KEY?: string
  }
}

function getRuntimeEnvValue(
  key: keyof NonNullable<RuntimeEnvGlobal["__env__"]>,
): string | undefined {
  const runtimeValue = (globalThis as RuntimeEnvGlobal).__env__?.[key]
  if (typeof runtimeValue === "string") return runtimeValue
  return process.env[key]
}

let cachedAdminClient: SupabaseClient | null = null
const ensuredBuckets = new Set<string>()

export function getSupabaseStatus() {
  const missing = [
    ["SUPABASE_URL", getRuntimeEnvValue("SUPABASE_URL")],
    ["SUPABASE_SERVICE_ROLE_KEY", getRuntimeEnvValue("SUPABASE_SERVICE_ROLE_KEY")],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key)

  return {
    configured: missing.length === 0,
    missing,
  }
}

export function getSupabaseAdmin() {
  const status = getSupabaseStatus()

  if (!status.configured) {
    throw new Error(
      `Supabase server env belum lengkap: ${status.missing.join(", ")}`
    )
  }

  const url = getRuntimeEnvValue("SUPABASE_URL") as string
  const key = getRuntimeEnvValue("SUPABASE_SERVICE_ROLE_KEY") as string

  if (!cachedAdminClient) {
    cachedAdminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return cachedAdminClient
}

export async function ensureSupabaseBucket(
  bucketId: string,
  options: {
    allowedMimeTypes?: string[]
    fileSizeLimit?: number
    public: boolean
  }
) {
  if (ensuredBuckets.has(bucketId)) {
    return
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.createBucket(bucketId, {
    allowedMimeTypes: options.allowedMimeTypes,
    fileSizeLimit: options.fileSizeLimit,
    public: options.public,
  })

  if (error && !/already exists/i.test(error.message)) {
    throw new Error(error.message)
  }

  ensuredBuckets.add(bucketId)
}
