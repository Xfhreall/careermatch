import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let cachedAdminClient: SupabaseClient | null = null
const ensuredBuckets = new Set<string>()

export function getSupabaseStatus() {
  const missing = [
    ["SUPABASE_URL", process.env.SUPABASE_URL],
    ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY],
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

  if (!cachedAdminClient) {
    cachedAdminClient = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
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
