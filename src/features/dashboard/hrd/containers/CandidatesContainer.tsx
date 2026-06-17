import { useQuery } from "@tanstack/react-query"

import { hrdCandidateColumns } from "@/features/dashboard/hrd/components/candidate-columns"
import { DataTable } from "@/shared/components/DataTable"
import { fetchHrdDashboard } from "@/shared/repository/platform/action"

const HRD_DASHBOARD_REFETCH_INTERVAL_MS = 30_000

export function HrdCandidatesContainer() {
  const dashboardQuery = useQuery({
    queryFn: fetchHrdDashboard,
    queryKey: ["hrd-dashboard"],
    refetchInterval: HRD_DASHBOARD_REFETCH_INTERVAL_MS,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-medium text-2xl">Kandidat Cocok</h1>
        <p className="text-muted-foreground text-sm">
          Daftar kandidat yang cocok dengan lowongan Anda, lengkap dengan nama
          dan email kontak.
        </p>
      </div>
      <DataTable
        columns={hrdCandidateColumns}
        data={dashboardQuery.data?.anonymousCandidates ?? []}
        loading={dashboardQuery.isLoading}
        searchPlaceholder="Cari berdasarkan nama, posisi, atau keahlian..."
        emptyTitle="Belum ada kandidat"
        emptyDescription="Kandidat akan muncul setelah lowongan dibuat dan CV dianalisis."
      />
    </div>
  )
}
