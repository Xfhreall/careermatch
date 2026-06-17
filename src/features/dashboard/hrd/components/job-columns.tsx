import type { ColumnDef } from "@tanstack/react-table"
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react"

import { statusVariant } from "@/features/dashboard/hrd/lib/job-utils"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import type { HrdJobRecord } from "@/shared/repository/platform/dto"

type HrdJobColumnsInput = {
  deleting: boolean
  onDelete: (job: HrdJobRecord) => void
  onEdit: (job: HrdJobRecord) => void
  onView: (job: HrdJobRecord) => void
}

export function createHrdJobColumns({
  deleting,
  onDelete,
  onEdit,
  onView,
}: HrdJobColumnsInput): ColumnDef<HrdJobRecord>[] {
  return [
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
            <Button
              aria-label="Lihat detail"
              onClick={() => onView(job)}
              size="icon-xs"
              variant="ghost"
            >
              <EyeIcon className="size-3.5" />
            </Button>
            <Button
              aria-label="Edit lowongan"
              onClick={() => onEdit(job)}
              size="icon-xs"
              variant="ghost"
            >
              <PencilIcon className="size-3.5" />
            </Button>
            <Button
              aria-label="Hapus lowongan"
              disabled={deleting}
              onClick={() => onDelete(job)}
              size="icon-xs"
              variant="ghost"
            >
              <TrashIcon className="size-3.5 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ]
}
