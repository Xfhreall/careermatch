import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { DownloadIcon, EyeIcon, TrashIcon } from "lucide-react"
import { toast } from "sonner"
import type { AnalysisHistoryItem } from "@/features/cv-analysis/types"
import { DataTable } from "@/shared/components/DataTable"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import {
  deleteAnalysisResultRequest,
  fetchAnalysisHistory,
} from "@/shared/repository/cv-analysis/action"

function formatScore(score?: number): string {
  if (score == null) return "-"
  return `${Math.round(score)}%`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getColumns(
  onDelete: (item: AnalysisHistoryItem) => void
): ColumnDef<AnalysisHistoryItem>[] {
  return [
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      accessorKey: "topRole",
      header: "Posisi Teratas",
      cell: ({ row }) => row.getValue("topRole") || "-",
    },
    {
      accessorKey: "topCompany",
      header: "Perusahaan",
      cell: ({ row }) => row.getValue("topCompany") || "-",
    },
    {
      accessorKey: "topScore",
      header: "Skor",
      cell: ({ row }) => {
        const score = row.getValue("topScore") as number | undefined
        return score != null ? (
          <Badge
            variant={
              score >= 70
                ? "default"
                : score >= 50
                  ? "secondary"
                  : "destructive"
            }
          >
            {formatScore(score)}
          </Badge>
        ) : (
          "-"
        )
      },
    },
    {
      accessorKey: "jobMatchCount",
      header: "Cocok",
      cell: ({ row }) => row.getValue("jobMatchCount"),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-1">
            <Button
              nativeButton={false}
              render={
                <Link
                  params={{ analysisId: item.analysisId }}
                  to="/jobseeker/analysis/$analysisId"
                />
              }
              variant="ghost"
              size="icon-xs"
              aria-label="Lihat detail"
            >
              <EyeIcon className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Export laporan"
              onClick={() => handleExport(item)}
            >
              <DownloadIcon className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Hapus"
              onClick={() => onDelete(item)}
            >
              <TrashIcon className="size-3.5 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ]
}

async function handleExport(item: AnalysisHistoryItem) {
  const { fetchAnalysisResult } = await import(
    "@/shared/repository/cv-analysis/action"
  )
  const result = await fetchAnalysisResult(item.analysisId)
  if (!result) return

  const report = [
    "CareerMatch Analysis Report",
    `Analysis ID: ${result.analysisId}`,
    "",
    "Top Matches",
    ...result.jobMatches.map(
      (match, i) =>
        `${i + 1}. ${match.jobTitle} - ${match.company} (${Math.round(match.compatibilityScore ?? 0)}%)`
    ),
    "",
    "Career Coaching",
    result.careerCoaching || "No coaching text.",
    "",
    "Full Response",
    JSON.stringify(result.rawResponse, null, 2),
  ].join("\n")

  const blob = new Blob([report], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${result.analysisId}-careermatch-report.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export function AnalysisHistoryContainer() {
  const queryClient = useQueryClient()
  const historyQuery = useQuery({
    queryFn: fetchAnalysisHistory,
    queryKey: ["analysis-history"],
  })
  const deleteMutation = useMutation({
    mutationFn: deleteAnalysisResultRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["analysis-history"] })
      toast.success("Analisis berhasil dihapus.")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Analisis gagal dihapus."
      )
    },
  })

  function handleDelete(item: AnalysisHistoryItem) {
    if (!confirm(`Hapus analisis "${item.analysisId}"?`)) {
      return
    }

    deleteMutation.mutate(item.analysisId)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-medium text-2xl">Riwayat Analisis CV</h1>
        <p className="text-muted-foreground text-sm">
          Daftar semua analisis CV yang pernah Anda lakukan.
        </p>
      </div>
      <DataTable
        columns={getColumns(handleDelete)}
        data={historyQuery.data ?? []}
        loading={historyQuery.isLoading}
        searchPlaceholder="Cari berdasarkan posisi atau perusahaan..."
        emptyTitle="Belum ada analisis"
        emptyDescription="Mulai dengan mengupload CV Anda di halaman Analisis CV."
      />
    </div>
  )
}
