import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"

import { fetchHrdDashboard } from "@/features/platform/api-client"
import type { AnonymousCandidateRecord } from "@/features/platform/types"
import { DataTable } from "@/shared/components/DataTable"
import { Badge } from "@/shared/components/shadcn/ui/badge"

const HRD_DASHBOARD_REFETCH_INTERVAL_MS = 30_000

const columns: ColumnDef<AnonymousCandidateRecord>[] = [
  {
    accessorKey: "role",
    header: "Posisi",
    cell: ({ row }) => row.getValue("role"),
  },
  {
    accessorKey: "candidate",
    header: "Kandidat",
    cell: ({ row }) => row.getValue("candidate"),
  },
  {
    accessorKey: "skills",
    header: "Keahlian",
    cell: ({ row }) => {
      const skills = (row.getValue("skills") as string)
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
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
    accessorKey: "score",
    header: "Skor",
    cell: ({ row }) => {
      const score = row.getValue("score") as string
      return <Badge variant="default">{score}</Badge>
    },
  },
]

export function HrdCandidatesContainer() {
  const dashboardQuery = useQuery({
    queryFn: fetchHrdDashboard,
    queryKey: ["hrd-dashboard"],
    refetchInterval: HRD_DASHBOARD_REFETCH_INTERVAL_MS,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-medium text-2xl">Kandidat Anonim</h1>
        <p className="text-muted-foreground text-sm">
          Daftar kandidat yang cocok dengan lowongan Anda (identitas
          disembunyikan).
        </p>
      </div>
      <DataTable
        columns={columns}
        data={dashboardQuery.data?.anonymousCandidates ?? []}
        loading={dashboardQuery.isLoading}
        searchPlaceholder="Cari berdasarkan posisi atau keahlian..."
        emptyTitle="Belum ada kandidat"
        emptyDescription="Kandidat akan muncul setelah lowongan dibuat dan CV dianalisis."
      />
    </div>
  )
}
