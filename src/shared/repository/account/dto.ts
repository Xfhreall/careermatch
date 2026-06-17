import { type AppRole, getUserRole } from "@/features/auth/lib/role-routing"

export {
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_FILE_SIZE_BYTES,
} from "./action"

export type AccountProfile = {
  email: string
  id: string
  image: string | null
  name: string
  role: AppRole
}

export function normalizeAccountProfile(
  profile: Record<string, unknown>
): AccountProfile {
  return {
    email: typeof profile.email === "string" ? profile.email : "",
    id: typeof profile.id === "string" ? profile.id : "",
    image: typeof profile.image === "string" ? profile.image : null,
    name: typeof profile.name === "string" ? profile.name : "",
    role: getUserRole(profile),
  }
}
