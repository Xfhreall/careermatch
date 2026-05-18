import { useQuery } from "@tanstack/react-query"
import { type ColumnDef } from "@tanstack/react-table"
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react"

import { fetchHrdDashboard } from "@/features/platform/api-client"
import type { HrdJobRecord } from "@/features/platform/types"
import { DataTable } from "@/shared/components/DataTable"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "active":
    case "approved":
      return "default"
    case "pending":
      return "secondary"
    case "rejected":
    case "expired":
      return "destructive"
    default:
      return "outline"
  }
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
      const years = row.getValue("minYears") as number
      return `${years} tahun`
    },
  },
  {
    accessorKey: "skills",
    header: "Keahlian",
    cell: ({ row }) => {
      const skills = row.getValue("skills") as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{skills.length - 3}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <Badge variant={statusVariant(status)}>{status}</Badge>
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
      const job = row.original
      return (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" aria-label="Lihat detail">
            <EyeIcon className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Edit lowongan">
            <PencilIcon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Hapus lowongan"
            onClick={() => handleDelete(job)}
          >
            <TrashIcon className="size-3.5 text-destructive" />
          </Button>
        </div>
      )
    },
  },
]

function handleDelete(job: HrdJobRecord) {
  if (confirm(`Hapus lowongan "${job.title}" di ${job.company}?`)) {
    console.log("Delete job:", job.id)
  }
}

export function HrdJobsContainer() {
  const dashboardQuery = useQuery({
    queryFn: fetchHrdDashboard,
    queryKey: ["hrd-dashboard"],
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-medium text-2xl">Kelola Lowongan</h1>
        <p className="text-muted-foreground text-sm">
          Daftar semua lowongan pekerjaan yang Anda buat.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={dashboardQuery.data?.jobs ?? []}
        loading={dashboardQuery.isLoading}
        searchPlaceholder="Cari berdasarkan posisi atau perusahaan..."
        emptyTitle="Belum ada lowongan"
        emptyDescription="Buat lowongan baru dari halaman Portal HRD."
      />
    </div>
  )
}
