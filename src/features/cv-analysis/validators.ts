export const MAX_CV_FILE_BYTES = 10 * 1024 * 1024

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"] as const

export type CvFileValidationResult =
  | {
      ok: true
      message?: undefined
    }
  | {
      ok: false
      message: string
    }

export function validateCvFile(
  file: File | null | undefined,
  maxBytes = MAX_CV_FILE_BYTES
): CvFileValidationResult {
  if (!file) {
    return {
      ok: false,
      message: "Silakan upload file CV terlebih dahulu.",
    }
  }

  const filename = file.name.toLowerCase()
  const hasValidExtension = ALLOWED_EXTENSIONS.some((extension) =>
    filename.endsWith(extension)
  )

  if (!hasValidExtension) {
    return {
      ok: false,
      message: "Format file harus .pdf, .doc, atau .docx.",
    }
  }

  if (file.size > maxBytes) {
    return {
      ok: false,
      message: `Ukuran file maksimal ${formatMegabytes(maxBytes)}.`,
    }
  }

  return { ok: true }
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatMegabytes(bytes: number) {
  const megabytes = bytes / (1024 * 1024)

  return `${Number.isInteger(megabytes) ? megabytes : megabytes.toFixed(1)}MB`
}
