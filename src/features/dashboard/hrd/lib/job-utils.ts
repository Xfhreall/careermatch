export type HrdJobStatus = "active" | "closed" | "draft"

export function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "active":
    case "approved":
      return "default"
    case "pending":
    case "draft":
      return "secondary"
    case "rejected":
    case "expired":
    case "closed":
      return "destructive"
    default:
      return "outline"
  }
}

export function normalizeStatus(status: string): HrdJobStatus {
  const lowerStatus = status.toLowerCase()

  if (lowerStatus === "closed" || lowerStatus === "draft") {
    return lowerStatus
  }

  return "active"
}

export function parseSkills(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
}
