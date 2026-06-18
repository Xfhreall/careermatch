import { hrdCandidateColumns } from "@/features/dashboard/hrd/components/candidate-columns"
import { useHrdDashboardQuery } from "@/features/dashboard/hrd/hooks/use-hrd-dashboard"
import { DataTable } from "@/shared/components/DataTable"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Progress } from "@/shared/components/shadcn/ui/progress"

export function HrdCandidatesContainer() {
  const dashboardQuery = useHrdDashboardQuery()
  const candidates = dashboardQuery.data?.anonymousCandidates ?? []
  const matchedRoles = new Set(candidates.map((candidate) => candidate.jobId))
    .size
  const averageScore =
    candidates.length > 0
      ? Math.round(
          candidates.reduce(
            (total, candidate) => total + candidate.scoreValue,
            0
          ) / candidates.length
        )
      : 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className="font-medium text-2xl">Kandidat Cocok</h1>
          <p className="text-muted-foreground text-sm">
            Daftar kandidat yang cocok dengan lowongan Anda, lengkap dengan nama
            dan email kontak.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-muted-foreground text-xs">Kandidat</p>
            <p className="mt-1 font-medium text-2xl">{candidates.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-muted-foreground text-xs">Role cocok</p>
            <p className="mt-1 font-medium text-2xl">{matchedRoles}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">Avg score</p>
              <Badge variant="secondary">{averageScore}%</Badge>
            </div>
            <Progress className="mt-3" value={averageScore} />
          </div>
        </div>
      </div>
      <DataTable
        columns={hrdCandidateColumns}
        data={candidates}
        loading={dashboardQuery.isLoading}
        searchPlaceholder="Cari berdasarkan nama, posisi, atau keahlian..."
        emptyTitle="Belum ada kandidat"
        emptyDescription="Kandidat akan muncul setelah lowongan dibuat dan CV dianalisis."
      />
    </div>
  )
}
