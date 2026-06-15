import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  createHrdJob,
  deleteHrdJob,
  fetchHrdDashboard,
  updateHrdJob,
} from "@/features/platform/api-client";
import type { HrdJobRecord } from "@/features/platform/types";
import { DataTable } from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/shadcn/ui/badge";
import { Button } from "@/shared/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/shadcn/ui/field";
import { Input } from "@/shared/components/shadcn/ui/input";

type HrdJobStatus = "active" | "closed" | "draft";

function statusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "active":
    case "approved":
      return "default";
    case "pending":
    case "draft":
      return "secondary";
    case "rejected":
    case "expired":
    case "closed":
      return "destructive";
    default:
      return "outline";
  }
}

function normalizeStatus(status: string): HrdJobStatus {
  const lowerStatus = status.toLowerCase();

  if (lowerStatus === "closed" || lowerStatus === "draft") {
    return lowerStatus;
  }

  return "active";
}

function parseSkills(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function HrdJobsContainer() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [confirmCreateOpen, setConfirmCreateOpen] = React.useState(false);
  const [createTitle, setCreateTitle] = React.useState("");
  const [createDescription, setCreateDescription] = React.useState("");
  const [createSkills, setCreateSkills] = React.useState("");
  const [createMinYears, setCreateMinYears] = React.useState("0");
  const createSubmissionPendingRef = React.useRef(false);
  const [viewJob, setViewJob] = React.useState<HrdJobRecord | null>(null);
  const [editJob, setEditJob] = React.useState<HrdJobRecord | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editSkills, setEditSkills] = React.useState("");
  const [editMinYears, setEditMinYears] = React.useState("0");
  const [editStatus, setEditStatus] = React.useState<HrdJobStatus>("active");
  const dashboardQuery = useQuery({
    queryFn: fetchHrdDashboard,
    queryKey: ["hrd-dashboard"],
  });
  const createMutation = useMutation({
    mutationFn: createHrdJob,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["hrd-dashboard"] });
    },
    onSuccess: (payload, variables) => {
      queryClient.setQueryData(["hrd-dashboard"], payload);
      setConfirmCreateOpen(false);
      setCreateOpen(false);
      resetCreateForm();
      toast.success(
        variables.status === "active"
          ? "Lowongan berhasil dipublikasikan."
          : "Lowongan berhasil disimpan sebagai draft.",
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Lowongan gagal dibuat.",
      );
    },
    onSettled: () => {
      createSubmissionPendingRef.current = false;
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateHrdJob,
    onSuccess: (payload) => {
      queryClient.setQueryData(["hrd-dashboard"], payload);
      setEditJob(null);
      toast.success("Lowongan berhasil diperbarui.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Lowongan gagal diperbarui.",
      );
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteHrdJob,
    onSuccess: (payload) => {
      queryClient.setQueryData(["hrd-dashboard"], payload);
      toast.success("Lowongan berhasil dihapus.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Lowongan gagal dihapus.",
      );
    },
  });

  React.useEffect(() => {
    if (!editJob) {
      return;
    }

    setEditTitle(editJob.title);
    setEditDescription(editJob.description);
    setEditSkills(editJob.skills.join(", "));
    setEditMinYears(String(editJob.minYears));
    setEditStatus(normalizeStatus(editJob.status));
  }, [editJob]);

  function handleDelete(job: HrdJobRecord) {
    if (!confirm(`Hapus lowongan "${job.title}" di ${job.company}?`)) {
      return;
    }

    deleteMutation.mutate({ id: job.id });
  }

  function resetCreateForm() {
    setCreateTitle("");
    setCreateDescription("");
    setCreateSkills("");
    setCreateMinYears("0");
  }

  function handleCreateOpenChange(open: boolean) {
    setCreateOpen(open);

    if (!open) {
      resetCreateForm();
    }
  }

  function handleSubmitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!createTitle.trim()) {
      toast.info("Judul lowongan wajib diisi.");
      return;
    }

    const minYears = Number(createMinYears);

    if (!Number.isFinite(minYears) || minYears < 0) {
      toast.info("Minimum pengalaman tidak valid.");
      return;
    }

    setCreateOpen(false);
    setConfirmCreateOpen(true);
  }

  function handleConfirmCreate(status: "active" | "draft") {
    if (createSubmissionPendingRef.current) {
      return;
    }

    createSubmissionPendingRef.current = true;
    createMutation.mutate({
      description: createDescription.trim(),
      minYears: Math.round(Number(createMinYears)),
      skills: parseSkills(createSkills),
      status,
      title: createTitle.trim(),
    });
  }

  function handleSubmitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editJob) {
      return;
    }

    const title = editTitle.trim();
    const minYears = Number(editMinYears);

    if (!title) {
      toast.info("Judul lowongan wajib diisi.");
      return;
    }

    if (!Number.isFinite(minYears) || minYears < 0) {
      toast.info("Minimum pengalaman tidak valid.");
      return;
    }

    updateMutation.mutate({
      description: editDescription.trim(),
      id: editJob.id,
      minYears,
      skills: parseSkills(editSkills),
      status: editStatus,
      title,
    });
  }

  const columns: ColumnDef<HrdJobRecord>[] = [
    {
      accessorKey: "title",
      header: "Posisi",
      cell: ({ row }) => row.getValue("title"),
    },
    {
      accessorKey: "company",
      header: "Perusahaan",
      cell: ({ row }) => row.getValue("company"),
    },
    {
      accessorKey: "minYears",
      header: "Min. Pengalaman",
      cell: ({ row }) => {
        const years = row.getValue("minYears") as number;
        return `${years} tahun`;
      },
    },
    {
      accessorKey: "skills",
      header: "Keahlian",
      cell: ({ row }) => {
        const skills = row.getValue("skills") as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 3).map((skill) => (
              <Badge className="text-xs" key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge className="text-xs" variant="outline">
                +{skills.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={statusVariant(status)}>{status}</Badge>;
      },
    },
    {
      accessorKey: "candidates",
      header: "Kandidat",
      cell: ({ row }) => row.getValue("candidates"),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              aria-label="Lihat detail"
              onClick={() => setViewJob(job)}
              size="icon-xs"
              variant="ghost"
            >
              <EyeIcon className="size-3.5" />
            </Button>
            <Button
              aria-label="Edit lowongan"
              onClick={() => setEditJob(job)}
              size="icon-xs"
              variant="ghost"
            >
              <PencilIcon className="size-3.5" />
            </Button>
            <Button
              aria-label="Hapus lowongan"
              disabled={deleteMutation.isPending}
              onClick={() => handleDelete(job)}
              size="icon-xs"
              variant="ghost"
            >
              <TrashIcon className="size-3.5 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

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
              <Field>
                <FieldLabel htmlFor="create-job-title">Posisi</FieldLabel>
                <Input
                  aria-label="Posisi baru"
                  id="create-job-title"
                  onChange={(event) => setCreateTitle(event.target.value)}
                  value={createTitle}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-job-description">
                  Deskripsi
                </FieldLabel>
                <textarea
                  aria-label="Deskripsi lowongan baru"
                  className="min-h-24 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  id="create-job-description"
                  onChange={(event) => setCreateDescription(event.target.value)}
                  value={createDescription}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-job-skills">Keahlian</FieldLabel>
                <Input
                  aria-label="Keahlian lowongan baru"
                  id="create-job-skills"
                  onChange={(event) => setCreateSkills(event.target.value)}
                  placeholder="Contoh: React, TypeScript"
                  value={createSkills}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-job-min-years">
                  Minimum pengalaman
                </FieldLabel>
                <Input
                  aria-label="Minimum pengalaman lowongan baru"
                  id="create-job-min-years"
                  onChange={(event) => setCreateMinYears(event.target.value)}
                  type="number"
                  value={createMinYears}
                />
              </Field>
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
            <p className="font-medium">{createTitle.trim()}</p>
            <p className="mt-1 text-muted-foreground text-sm">
              Minimum pengalaman {Math.round(Number(createMinYears))} tahun
            </p>
          </div>
          <DialogFooter>
            <Button
              disabled={createMutation.isPending}
              onClick={() => {
                setConfirmCreateOpen(false);
                setCreateOpen(true);
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
              <Field>
                <FieldLabel htmlFor="job-title">Posisi</FieldLabel>
                <Input
                  id="job-title"
                  onChange={(event) => setEditTitle(event.target.value)}
                  value={editTitle}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="job-description">Deskripsi</FieldLabel>
                <textarea
                  className="min-h-24 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  id="job-description"
                  onChange={(event) => setEditDescription(event.target.value)}
                  value={editDescription}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="job-skills">Keahlian</FieldLabel>
                <Input
                  id="job-skills"
                  onChange={(event) => setEditSkills(event.target.value)}
                  value={editSkills}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="job-min-years">
                  Minimum pengalaman
                </FieldLabel>
                <Input
                  id="job-min-years"
                  min={0}
                  onChange={(event) => setEditMinYears(event.target.value)}
                  type="number"
                  value={editMinYears}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="job-status">Status</FieldLabel>
                <select
                  className="h-10 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  id="job-status"
                  onChange={(event) =>
                    setEditStatus(event.target.value as HrdJobStatus)
                  }
                  value={editStatus}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </Field>
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
  );
}
