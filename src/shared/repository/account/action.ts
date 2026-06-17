import { ensureSupabaseBucket, getSupabaseAdmin } from "@/lib/server/supabase"

const AVATAR_BUCKET_ID = "avatars"
const AVATAR_BUCKET_PREFIX = "/storage/v1/object/public/avatars/"

export const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const

export const MAX_AVATAR_FILE_SIZE_BYTES = 5 * 1024 * 1024

export function validateAvatarFile(file: File) {
  if (file.size <= 0) {
    return "File avatar tidak valid."
  }

  if (file.size > MAX_AVATAR_FILE_SIZE_BYTES) {
    return "Ukuran avatar maksimal 5MB."
  }

  if (
    !ALLOWED_AVATAR_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number]
    )
  ) {
    return "Format avatar harus JPG, PNG, WEBP, AVIF, atau GIF."
  }

  return null
}

export async function uploadAvatarToStorage(userId: string, file: File) {
  await ensureSupabaseBucket(AVATAR_BUCKET_ID, {
    allowedMimeTypes: [...ALLOWED_AVATAR_MIME_TYPES],
    fileSizeLimit: MAX_AVATAR_FILE_SIZE_BYTES,
    public: true,
  })

  const supabase = getSupabaseAdmin()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase()
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET_ID)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET_ID).getPublicUrl(path)

  return {
    path,
    publicUrl: data.publicUrl,
  }
}

export async function removeAvatarFromStorageByPublicUrl(
  publicUrl?: string | null
) {
  if (!publicUrl) {
    return
  }

  const objectPath = extractAvatarObjectPath(publicUrl)

  if (!objectPath) {
    return
  }

  const supabase = getSupabaseAdmin()
  await supabase.storage.from(AVATAR_BUCKET_ID).remove([objectPath])
}

function extractAvatarObjectPath(publicUrl: string) {
  try {
    const url = new URL(publicUrl)
    const markerIndex = url.pathname.indexOf(AVATAR_BUCKET_PREFIX)

    if (markerIndex < 0) {
      return null
    }

    const objectPath = decodeURIComponent(
      url.pathname.slice(markerIndex + AVATAR_BUCKET_PREFIX.length)
    )

    if (!objectPath) {
      return null
    }

    return objectPath
  } catch {
    return null
  }
}
