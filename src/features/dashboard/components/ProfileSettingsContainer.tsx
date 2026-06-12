import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UploadIcon } from "lucide-react"
import { type ChangeEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { getUserRole } from "@/features/auth/role-routing"
import {
  normalizeUser,
  setUserCache,
  userQueryKey,
  useUserQuery,
} from "@/features/auth/user-query"
import {
  changeAccountPassword,
  updateAccountProfile,
} from "@/features/dashboard/api-client"
import {
  fetchHrdRequestStatus,
  submitHrdRequest,
} from "@/features/platform/api-client"
import { authClient } from "@/lib/auth-client"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/shadcn/ui/field"
import { Input } from "@/shared/components/shadcn/ui/input"

function getRoleLabel(role: ReturnType<typeof getUserRole>) {
  if (role === "superadmin") return "Superadmin"
  if (role === "hrd") return "HRD"
  return "Jobseeker"
}

export function ProfileSettingsContainer() {
  const queryClient = useQueryClient()
  const session = authClient.useSession()
  const hasSession = Boolean(session.data?.user)
  const userQuery = useUserQuery({
    enabled: hasSession,
  })
  const currentUser = userQuery.data ?? normalizeUser(session.data?.user)
  const role = getUserRole(currentUser ?? session.data?.user)
  const roleLabel = getRoleLabel(role)

  const requestStatusQuery = useQuery({
    queryKey: ["hrd-request-status"],
    queryFn: fetchHrdRequestStatus,
    enabled: role === "jobseeker",
  })

  const submitHrdMutation = useMutation({
    mutationFn: submitHrdRequest,
    onSuccess: () => {
      void requestStatusQuery.refetch()
      toast.success("Permintaan registrasi HRD berhasil diajukan.")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengajukan permintaan HRD."
      )
    },
  })

  const hrdForm = useForm({
    defaultValues: {
      companyName: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.companyName.trim()) {
        toast.info("Nama perusahaan wajib diisi.")
        return
      }
      submitHrdMutation.mutate({ companyName: value.companyName.trim() })
    },
  })

  const [profileName, setProfileName] = useState("")
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  )
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  const profileForm = useForm({
    defaultValues: {
      avatarFile: null as File | null,
      name: "",
    },
    onSubmit: async ({ value, formApi }) => {
      if (isSavingProfile) {
        return
      }

      const normalizedName = value.name.trim()
      if (!normalizedName) {
        toast.info("Username wajib diisi sebelum menyimpan profile.")
        setProfileMessage("Username wajib diisi.")
        return
      }

      setIsSavingProfile(true)
      setProfileMessage(null)
      toast.info("Menyimpan profile...")

      try {
        const profile = await updateAccountProfile({
          avatarFile: value.avatarFile,
          name: normalizedName,
        })

        if (avatarPreview?.startsWith("blob:")) {
          URL.revokeObjectURL(avatarPreview)
        }

        formApi.setFieldValue("avatarFile", null)
        formApi.setFieldValue("name", profile.name)
        setSelectedAvatarFile(null)
        setProfileName(profile.name)
        setAvatarPreview(profile.image)
        setUserCache(queryClient, profile)
        await queryClient.invalidateQueries({
          queryKey: userQueryKey,
          refetchType: "active",
        })
        toast.success("Profile berhasil diperbarui.")
        setProfileMessage("Profile berhasil diperbarui.")
        await authClient.getSession()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Gagal menyimpan profile."
        )
        setProfileMessage(
          error instanceof Error ? error.message : "Gagal menyimpan profile."
        )
      } finally {
        setIsSavingProfile(false)
      }
    },
  })

  const passwordForm = useForm({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    },
    onSubmit: async ({ value, formApi }) => {
      if (isChangingPassword) {
        return
      }

      if (
        !value.currentPassword ||
        !value.newPassword ||
        !value.confirmPassword
      ) {
        toast.info("Semua field password wajib diisi.")
        setPasswordMessage("Semua field password wajib diisi.")
        return
      }
      if (value.newPassword !== value.confirmPassword) {
        toast.info("Password baru dan konfirmasi password harus sama.")
        setPasswordMessage("Password baru dan konfirmasi password belum sama.")
        return
      }
      if (value.newPassword.length < 8) {
        toast.info("Password baru minimal 8 karakter.")
        setPasswordMessage("Password baru minimal 8 karakter.")
        return
      }

      setIsChangingPassword(true)
      setPasswordMessage(null)
      toast.info("Menyimpan password baru...")

      try {
        await changeAccountPassword({
          confirmPassword: value.confirmPassword,
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        })

        formApi.reset({
          confirmPassword: "",
          currentPassword: "",
          newPassword: "",
        })
        toast.success("Password berhasil diubah.")
        setPasswordMessage("Password berhasil diubah.")
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Gagal mengubah password."
        )
        setPasswordMessage(
          error instanceof Error ? error.message : "Gagal mengubah password."
        )
      } finally {
        setIsChangingPassword(false)
      }
    },
  })

  const email = currentUser?.email ?? session.data?.user?.email ?? "-"
  const currentName = currentUser?.name ?? session.data?.user?.name ?? ""
  const avatarUrl = currentUser?.image ?? session.data?.user?.image ?? null
  const displayAvatar = avatarUrl ?? avatarPreview
  const canSaveProfile = profileName.trim().length > 0 && !isSavingProfile
  const initials = useMemo(() => {
    const source = (profileName || currentName || "U").trim()
    if (!source) return "U"
    const chunks = source.split(/\s+/).filter(Boolean).slice(0, 2)
    return chunks.map((chunk) => chunk[0]?.toUpperCase() ?? "").join("")
  }, [currentName, profileName])

  useEffect(() => {
    profileForm.setFieldValue("name", currentName)
    setProfileName(currentName)
  }, [currentName, profileForm])

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview)
    }

    profileForm.setFieldValue("avatarFile", file)
    setSelectedAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setProfileMessage(null)
  }

  return (
    <div className="mx-auto w-full max-w-5xl overflow-x-hidden py-4">
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-muted-foreground text-sm">Profile settings</p>
        <h1 className="mt-1 font-medium text-3xl">Kelola profile akun</h1>
        <p className="mt-3 text-muted-foreground text-sm">
          Update avatar, username, dan password akun kamu.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-medium text-xl">Informasi profile</h2>
          <form
            className="mt-5"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void profileForm.handleSubmit()
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel>Avatar</FieldLabel>
                <div className="flex items-center gap-4">
                  {displayAvatar ? (
                    <img
                      alt="Avatar preview"
                      className="size-16 rounded-full border border-border object-cover"
                      src={displayAvatar}
                    />
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-full border border-border bg-muted font-medium text-sm">
                      {initials}
                    </div>
                  )}
                  <label className="inline-flex">
                    <input
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      type="file"
                    />
                    <span className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm">
                      <UploadIcon aria-hidden="true" className="size-4" />
                      Upload avatar
                    </span>
                  </label>
                </div>
                {selectedAvatarFile ? (
                  <FieldDescription>
                    File dipilih: {selectedAvatarFile.name}
                  </FieldDescription>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="profile-role">Role</FieldLabel>
                <Input disabled id="profile-role" readOnly value={roleLabel} />
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                <Input disabled id="profile-email" readOnly value={email} />
              </Field>
              <profileForm.Field name="name">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="profile-name">Username</FieldLabel>
                    <Input
                      id="profile-name"
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value)
                        setProfileName(event.target.value)
                      }}
                      placeholder="Masukkan username"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </profileForm.Field>
            </FieldGroup>

            <div className="mt-5">
              <Button disabled={!canSaveProfile} type="submit">
                {isSavingProfile ? "Menyimpan..." : "Simpan profile"}
              </Button>
              {profileMessage ? (
                <p className="mt-3 text-muted-foreground text-sm">
                  {profileMessage}
                </p>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-medium text-xl">Ganti password</h2>
          <form
            className="mt-5"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void passwordForm.handleSubmit()
            }}
          >
            <FieldGroup>
              <passwordForm.Field name="currentPassword">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="current-password">
                      Password sekarang
                    </FieldLabel>
                    <Input
                      id="current-password"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      type="password"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </passwordForm.Field>

              <passwordForm.Field name="newPassword">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="new-password">
                      Password baru
                    </FieldLabel>
                    <Input
                      id="new-password"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      type="password"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </passwordForm.Field>

              <passwordForm.Field name="confirmPassword">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Konfirmasi password baru
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      type="password"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </passwordForm.Field>
            </FieldGroup>

            <div className="mt-5">
              <Button
                disabled={isChangingPassword}
                type="submit"
                variant="outline"
              >
                {isChangingPassword ? "Menyimpan..." : "Ubah password"}
              </Button>
              {passwordMessage ? (
                <p className="mt-3 text-muted-foreground text-sm">
                  {passwordMessage}
                </p>
              ) : null}
            </div>
          </form>
        </section>
      </div>

      {role === "jobseeker" && (
        <section className="mt-6 rounded-lg border border-border bg-card p-6">
          <h2 className="font-medium text-xl">Registrasi Akun HRD</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Ajukan permohonan registrasi akun HRD untuk perusahaan Anda agar
            bisa memposting lowongan kerja dan mencari kandidat.
          </p>

          {requestStatusQuery.isLoading ? (
            <p className="mt-4 text-muted-foreground text-sm">
              Memuat status pengajuan...
            </p>
          ) : requestStatusQuery.data ? (
            <div className="mt-5 rounded-md border border-border bg-muted/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">
                    Perusahaan:{" "}
                    <span className="text-foreground">
                      {requestStatusQuery.data.companyName}
                    </span>
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Diajukan pada:{" "}
                    {new Date(
                      requestStatusQuery.data.createdAt
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Status:</span>
                  {requestStatusQuery.data.status === "pending" ? (
                    <Badge
                      className="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      variant="outline"
                    >
                      Menunggu Persetujuan
                    </Badge>
                  ) : requestStatusQuery.data.status === "rejected" ? (
                    <Badge variant="destructive">Ditolak</Badge>
                  ) : (
                    <Badge
                      className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      variant="outline"
                    >
                      Disetujui
                    </Badge>
                  )}
                </div>
              </div>

              {requestStatusQuery.data.status === "pending" && (
                <p className="mt-3 text-muted-foreground text-xs italic">
                  * Permintaan Anda sedang diproses oleh tim Superadmin. Mohon
                  tunggu proses verifikasi.
                </p>
              )}

              {requestStatusQuery.data.status === "rejected" && (
                <div className="mt-4 border-border border-t pt-4">
                  <p className="mb-3 text-destructive text-xs">
                    Pengajuan Anda sebelumnya ditolak. Anda dapat mengajukan
                    kembali dengan nama perusahaan lain di bawah ini.
                  </p>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      void hrdForm.handleSubmit()
                    }}
                  >
                    <hrdForm.Field name="companyName">
                      {(field) => (
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Input
                            id="hrd-company-name-retry"
                            placeholder="Masukkan nama perusahaan baru"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="max-w-md"
                          />
                          <Button
                            disabled={submitHrdMutation.isPending}
                            type="submit"
                          >
                            {submitHrdMutation.isPending
                              ? "Mengirim..."
                              : "Kirim Ulang"}
                          </Button>
                        </div>
                      )}
                    </hrdForm.Field>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void hrdForm.handleSubmit()
              }}
            >
              <hrdForm.Field name="companyName">
                {(field) => (
                  <Field className="max-w-md">
                    <FieldLabel htmlFor="hrd-company-name">
                      Nama Perusahaan
                    </FieldLabel>
                    <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                      <Input
                        id="hrd-company-name"
                        placeholder="Contoh: PT Teknologi Maju"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <Button
                        disabled={submitHrdMutation.isPending}
                        type="submit"
                      >
                        {submitHrdMutation.isPending
                          ? "Mengirim..."
                          : "Ajukan Registrasi"}
                      </Button>
                    </div>
                    <FieldDescription>
                      Pastikan nama perusahaan sesuai untuk mempermudah proses
                      verifikasi.
                    </FieldDescription>
                  </Field>
                )}
              </hrdForm.Field>
            </form>
          )}
        </section>
      )}
    </div>
  )
}
