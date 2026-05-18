import { useQuery } from "@tanstack/react-query"
import { type ColumnDef } from "@tanstack/react-table"
import { EyeIcon, DownloadIcon, TrashIcon } from "lucide-react"

import { fetchAnalysisHistory } from "@/features/cv-analysis/api-client"
import type { AnalysisHistoryItem } from "@/features/cv-analysis/types"
import { DataTable } from "@/shared/components/DataTable"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"

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

const columns: ColumnDef<AnalysisHistoryItem>[] = [
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
        <Badge variant={score >= 70 ? "default" : score >= 50 ? "secondary" : "destructive"}>
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
            variant="ghost"
            size="icon-xs"
            aria-label="Lihat detail"
            onClick={() => {
              window.location.href = `/jobseeker/analysis/${item.analysisId}`
            }}
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
            onClick={() => handleDelete(item)}
          >
            <TrashIcon className="size-3.5 text-destructive" />
          </Button>
        </div>
      )
    },
  },
]

async function handleExport(item: AnalysisHistoryItem) {
  const { fetchAnalysisResult } = await import("@/features/cv-analysis/api-client")
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

function handleDelete(item: AnalysisHistoryItem) {
  if (confirm(`Hapus analisis "${item.analysisId}"?`)) {
    console.log("Delete analysis:", item.analysisId)
  }
}

export function AnalysisHistoryContainer() {
  const historyQuery = useQuery({
    queryFn: fetchAnalysisHistory,
    queryKey: ["analysis-history"],
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-medium text-2xl">Riwayat Analisis CV</h1>
        <p className="text-muted-foreground text-sm">
          Daftar semua analisis CV yang pernah Anda lakukan.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={historyQuery.data ?? []}
        loading={historyQuery.isLoading}
        searchPlaceholder="Cari berdasarkan posisi atau perusahaan..."
        emptyTitle="Belum ada analisis"
        emptyDescription="Mulai dengan mengupload CV Anda di halaman Analisis CV."
      />
    </div>
  )
}
