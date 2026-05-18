import { getUserRole, type AppRole } from "@/features/auth/role-routing"

export type AccountProfile = {
  email: string
  id: string
  image: string | null
  name: string
  role: AppRole
}

export async function updateAccountProfile(input: {
  avatarFile?: File | null
  name: string
  removeAvatar?: boolean
}): Promise<AccountProfile> {
  const body = new FormData()
  body.append("name", input.name)

  if (input.removeAvatar) {
    body.append("removeAvatar", "true")
  }

  if (input.avatarFile) {
    body.append("avatar", input.avatarFile)
  }

  const response = await fetch("/api/account/profile", {
    body,
    method: "PATCH",
  })
  const payload = await readPayload(response)

  if (!response.ok) {
    throw new Error(readErrorMessage(payload, response.status))
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("profile" in payload) ||
    typeof payload.profile !== "object" ||
    payload.profile === null
  ) {
    throw new Error("Response profile tidak valid.")
  }

  return normalizeAccountProfile(payload.profile as Record<string, unknown>)
}

export async function changeAccountPassword(input: {
  confirmPassword: string
  currentPassword: string
  newPassword: string
}) {
  const response = await fetch("/api/account/password", {
    body: JSON.stringify(input),
    headers: {
      "content-type": "application/json",
    },
    method: "PATCH",
  })
  const payload = await readPayload(response)

  if (!response.ok) {
    throw new Error(readErrorMessage(payload, response.status))
  }
}

function normalizeAccountProfile(
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

async function readPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  return response.text()
}

function readErrorMessage(payload: unknown, status: number) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message
  }

  if (typeof payload === "string" && payload.length > 0) {
    return payload
  }

  return `Server merespons dengan status ${status}`
}
