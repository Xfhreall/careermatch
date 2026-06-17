import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PlusIcon, SaveIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { createHrdJobColumns } from "@/features/dashboard/hrd/components/job-columns"
import {
  type HrdJobStatus,
  normalizeStatus,
  parseSkills,
  statusVariant,
} from "@/features/dashboard/hrd/lib/job-utils"
import { DataTable } from "@/shared/components/DataTable"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/shadcn/ui/field"
import { Input } from "@/shared/components/shadcn/ui/input"
import {
  createHrdJob,
  deleteHrdJob,
  fetchHrdDashboard,
  updateHrdJob,
} from "@/shared/repository/platform/action"
import type { HrdJobRecord } from "@/shared/repository/platform/dto"

const HRD_DASHBOARD_REFETCH_INTERVAL_MS = 30_000

export function HrdJobsContainer() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [confirmCreateOpen, setConfirmCreateOpen] = React.useState(false)
  const createSubmissionPendingRef = React.useRef(false)
  const [viewJob, setViewJob] = React.useState<HrdJobRecord | null>(null)
  const [editJob, setEditJob] = React.useState<HrdJobRecord | null>(null)
  const dashboardQuery = useQuery({
    queryFn: fetchHrdDashboard,
    queryKey: ["hrd-dashboard"],
    refetchInterval: HRD_DASHBOARD_REFETCH_INTERVAL_MS,
  })
  const createMutation = useMutation({
    mutationFn: createHrdJob,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["hrd-dashboard"] })
    },
    onSuccess: (payload, variables) => {
      queryClient.setQueryData(["hrd-dashboard"], payload)
      setConfirmCreateOpen(false)
      setCreateOpen(false)
      resetCreateForm()
      toast.success(
        variables.status === "active"
          ? "Lowongan berhasil dipublikasikan."
          : "Lowongan berhasil disimpan sebagai draft."
      )
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Lowongan gagal dibuat."
      )
    },
    onSettled: () => {
      createSubmissionPendingRef.current = false
    },
  })
  const updateMutation = useMutation({
    mutationFn: updateHrdJob,
    onSuccess: (payload) => {
      queryClient.setQueryData(["hrd-dashboard"], payload)
      setEditJob(null)
      toast.success("Lowongan berhasil diperbarui.")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Lowongan gagal diperbarui."
      )
    },
  })
  const deleteMutation = useMutation({
    mutationFn: deleteHrdJob,
    onSuccess: (payload) => {
      queryClient.setQueryData(["hrd-dashboard"], payload)
      toast.success("Lowongan berhasil dihapus.")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Lowongan gagal dihapus."
      )
    },
  })
  const createForm = useForm({
    defaultValues: {
      description: "",
      minYears: "0",
      skills: "",
      title: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.title.trim()) {
        toast.info("Judul lowongan wajib diisi.")
        return
      }

      const minYears = Number(value.minYears)

      if (!Number.isFinite(minYears) || minYears < 0) {
        toast.info("Minimum pengalaman tidak valid.")
        return
      }

      setCreateOpen(false)
      setConfirmCreateOpen(true)
    },
  })
  const editForm = useForm({
    defaultValues: {
      description: "",
      minYears: "0",
      skills: "",
      status: "active" as HrdJobStatus,
      title: "",
    },
    onSubmit: async ({ value }) => {
      if (!editJob) {
        return
      }

      const title = value.title.trim()
      const minYears = Number(value.minYears)

      if (!title) {
        toast.info("Judul lowongan wajib diisi.")
        return
      }

      if (!Number.isFinite(minYears) || minYears < 0) {
        toast.info("Minimum pengalaman tidak valid.")
        return
      }

      updateMutation.mutate({
        description: value.description.trim(),
        id: editJob.id,
        minYears: Math.round(minYears),
        skills: parseSkills(value.skills),
        status: value.status,
        title,
      })
    },
  })
  const createValues = createForm.state.values

  React.useEffect(() => {
    if (!editJob) {
      return
    }

    editForm.setFieldValue("title", editJob.title)
    editForm.setFieldValue("description", editJob.description)
    editForm.setFieldValue("skills", editJob.skills.join(", "))
    editForm.setFieldValue("minYears", String(editJob.minYears))
    editForm.setFieldValue("status", normalizeStatus(editJob.status))
  }, [editForm, editJob])

  function handleDelete(job: HrdJobRecord) {
    if (!confirm(`Hapus lowongan "${job.title}" di ${job.company}?`)) {
      return
    }

    deleteMutation.mutate({ id: job.id })
  }

  function resetCreateForm() {
    createForm.reset()
  }

  function handleCreateOpenChange(open: boolean) {
    setCreateOpen(open)

    if (!open) {
      resetCreateForm()
    }
  }

  function handleSubmitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void createForm.handleSubmit()
  }

  function handleConfirmCreate(status: "active" | "draft") {
    if (createSubmissionPendingRef.current) {
      return
    }

    createSubmissionPendingRef.current = true
    createMutation.mutate({
      description: createValues.description.trim(),
      minYears: Math.round(Number(createValues.minYears)),
      skills: parseSkills(createValues.skills),
      status,
      title: createValues.title.trim(),
    })
  }

  function handleSubmitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void editForm.handleSubmit()
  }

  const columns = createHrdJobColumns({
    deleting: deleteMutation.isPending,
    onDelete: handleDelete,
    onEdit: setEditJob,
    onView: setViewJob,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-medium text-2xl">Kelola Lowongan</h1>
          <p className="text-muted-foreground text-sm">
            Daftar lowongan dari database sesuai akses role Anda.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
          Buka Lowongan
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={dashboardQuery.data?.jobs ?? []}
        emptyDescription="Buat lowongan baru dari halaman Portal HRD."
        emptyTitle="Belum ada lowongan"
        loading={dashboardQuery.isLoading}
        searchPlaceholder="Cari berdasarkan posisi atau perusahaan..."
      />

      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Buka lowongan</DialogTitle>
            <DialogDescription>
              Isi detail lowongan sebelum memilih untuk mempublikasikan atau
              menyimpannya sebagai draft.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleSubmitCreate}>
            <FieldGroup>
              <createForm.Field name="title">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="create-job-title">Posisi</FieldLabel>
                    <Input
                      aria-label="Posisi baru"
                      id="create-job-title"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      value={field.state.value}
                    />
                  </Field>
                )}
              </createForm.Field>
              <createForm.Field name="description">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="create-job-description">
                      Deskripsi
                    </FieldLabel>
                    <textarea
                      aria-label="Deskripsi lowongan baru"
                      className="min-h-24 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                      id="create-job-description"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      value={field.state.value}
                    />
                  </Field>
                )}
              </createForm.Field>
              <createForm.Field name="skills">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="create-job-skills">
                      Keahlian
                    </FieldLabel>
                    <Input
                      aria-label="Keahlian lowongan baru"
                      id="create-job-skills"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Contoh: React, TypeScript"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </createForm.Field>
              <createForm.Field name="minYears">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="create-job-min-years">
                      Minimum pengalaman
                    </FieldLabel>
                    <Input
                      aria-label="Minimum pengalaman lowongan baru"
                      id="create-job-min-years"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      type="number"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </createForm.Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                onClick={() => handleCreateOpenChange(false)}
                type="button"
                variant="outline"
              >
                Batal
              </Button>
              <Button type="submit">Lanjutkan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmCreateOpen}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Konfirmasi lowongan</DialogTitle>
            <DialogDescription>
              Publikasikan lowongan sekarang agar langsung aktif, atau simpan
              sebagai draft untuk dilanjutkan nanti.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="font-medium">{createValues.title.trim()}</p>
            <p className="mt-1 text-muted-foreground text-sm">
              Minimum pengalaman {Math.round(Number(createValues.minYears))}{" "}
              tahun
            </p>
          </div>
          <DialogFooter>
            <Button
              disabled={createMutation.isPending}
              onClick={() => {
                setConfirmCreateOpen(false)
                setCreateOpen(true)
              }}
              type="button"
              variant="outline"
            >
              Kembali
            </Button>
            <Button
              disabled={createMutation.isPending}
              onClick={() => handleConfirmCreate("draft")}
              type="button"
              variant="secondary"
            >
              Simpan sebagai Draft
            </Button>
            <Button
              disabled={createMutation.isPending}
              onClick={() => handleConfirmCreate("active")}
              type="button"
            >
              Publikasikan Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewJob)}
        onOpenChange={(open) => !open && setViewJob(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewJob?.title}</DialogTitle>
            <DialogDescription>{viewJob?.company}</DialogDescription>
          </DialogHeader>
          {viewJob ? (
            <div className="grid gap-4">
              <div className="grid gap-2 rounded-lg border border-border bg-background p-4">
                <span className="text-muted-foreground text-sm">Deskripsi</span>
                <p className="leading-7">
                  {viewJob.description || "Belum ada deskripsi lowongan."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-muted-foreground text-sm">Status</p>
                  <Badge
                    className="mt-2"
                    variant={statusVariant(viewJob.status)}
                  >
                    {viewJob.status}
                  </Badge>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-muted-foreground text-sm">Kandidat</p>
                  <p className="mt-2 font-medium text-2xl">
                    {viewJob.candidates}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {viewJob.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editJob)}
        onOpenChange={(open) => !open && setEditJob(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit lowongan</DialogTitle>
            <DialogDescription>
              Perubahan disimpan ke Supabase dan embedding ditandai pending.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleSubmitEdit}>
            <FieldGroup>
              <editForm.Field name="title">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="job-title">Posisi</FieldLabel>
                    <Input
                      id="job-title"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      value={field.state.value}
                    />
                  </Field>
                )}
              </editForm.Field>
              <editForm.Field name="description">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="job-description">Deskripsi</FieldLabel>
                    <textarea
                      className="min-h-24 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                      id="job-description"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      value={field.state.value}
                    />
                  </Field>
                )}
              </editForm.Field>
              <editForm.Field name="skills">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="job-skills">Keahlian</FieldLabel>
                    <Input
                      id="job-skills"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      value={field.state.value}
                    />
                  </Field>
                )}
              </editForm.Field>
              <editForm.Field name="minYears">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="job-min-years">
                      Minimum pengalaman
                    </FieldLabel>
                    <Input
                      id="job-min-years"
                      min={0}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      type="number"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </editForm.Field>
              <editForm.Field name="status">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="job-status">Status</FieldLabel>
                    <select
                      className="h-10 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                      id="job-status"
                      onChange={(event) =>
                        field.handleChange(event.target.value as HrdJobStatus)
                      }
                      value={field.state.value}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="closed">Closed</option>
                    </select>
                  </Field>
                )}
              </editForm.Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                disabled={updateMutation.isPending}
                onClick={() => setEditJob(null)}
                type="button"
                variant="outline"
              >
                Batal
              </Button>
              <Button disabled={updateMutation.isPending} type="submit">
                <SaveIcon aria-hidden="true" data-icon="inline-start" />
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
