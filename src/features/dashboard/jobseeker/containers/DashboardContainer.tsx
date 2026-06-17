import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  BriefcaseBusinessIcon,
  DatabaseIcon,
  FileSearchIcon,
  HistoryIcon,
  TrendingUpIcon,
} from "lucide-react"
import { PlatformHeader } from "@/features/platform/components/PlatformHeader"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import { fetchAnalysisHistory } from "@/shared/repository/cv-analysis/action"

export function JobseekerDashboardContainer() {
  const historyQuery = useQuery({
    queryFn: fetchAnalysisHistory,
    queryKey: ["analysis-history"],
  })
  const historyItems = historyQuery.data ?? []
  const latestHistory = historyItems[0]
  const totalMatches = historyItems.reduce(
    (sum, item) => sum + item.jobMatchCount,
    0
  )
  const latestScore = latestHistory?.topScore
  const metricCards = [
    {
      icon: DatabaseIcon,
      label: "Analisis tersimpan",
      value: historyQuery.isLoading ? "..." : String(historyItems.length),
      helper: "Diambil dari Supabase",
    },
    {
      icon: TrendingUpIcon,
      label: "Top score terakhir",
      value: latestScore == null ? "-" : `${Math.round(Number(latestScore))}%`,
      helper: latestHistory?.topRole ?? "Belum ada hasil",
    },
    {
      icon: BriefcaseBusinessIcon,
      label: "Total job match",
      value: historyQuery.isLoading ? "..." : String(totalMatches),
      helper: "Akumulasi riwayat CV",
    },
  ]

  return (
    <div className="paper-grid min-h-dvh overflow-x-hidden bg-background">
      <PlatformHeader
        description="Ringkasan akun jobseeker, status analisis terakhir, dan akses cepat ke fitur utama."
        eyebrow="Overview"
        showNavbar={false}
        title="Jobseeker dashboard"
      />

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {metricCards.map((card) => (
          <div
            className="rounded-lg border border-border bg-card p-6"
            key={card.label}
          >
            <card.icon
              aria-hidden="true"
              className="size-5 text-accent-foreground"
            />
            <div className="mt-5 flex items-start justify-between gap-4">
              <h2 className="font-medium text-muted-foreground text-sm">
                {card.label}
              </h2>
              <Badge variant="outline">Live</Badge>
            </div>
            <p className="mt-3 font-medium text-4xl">{card.value}</p>
            <p className="mt-3 text-muted-foreground text-sm">{card.helper}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-medium text-xl">Quick actions</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Jalankan analisis CV baru atau buka halaman riwayat.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              render={<Link to="/jobseeker/analyze" />}
            >
              <FileSearchIcon aria-hidden="true" data-icon="inline-start" />
              Buka Analisis CV
            </Button>
            <Button
              nativeButton={false}
              render={<Link to="/jobseeker/history" />}
              variant="outline"
            >
              <HistoryIcon aria-hidden="true" data-icon="inline-start" />
              Buka Riwayat
            </Button>
            <Button
              nativeButton={false}
              render={<Link to="/jobseeker/profile" />}
              variant="ghost"
            >
              Daftar Akun HRD
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-medium text-xl">Status riwayat</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            {historyQuery.isLoading
              ? "Memuat ringkasan riwayat..."
              : `${historyItems.length} analisis tersimpan`}
          </p>
          {latestHistory ? (
            <div className="mt-5 space-y-2 text-sm">
              <p className="font-medium text-foreground">
                {latestHistory.topRole ?? "Analysis report"}
              </p>
              <p className="text-muted-foreground">
                {latestHistory.topCompany ?? "CareerMatch"} -{" "}
                {new Date(latestHistory.createdAt).toLocaleString("id-ID")}
              </p>
              <div className="flex gap-2">
                <Badge className="bg-accent text-accent-foreground">
                  {latestHistory.jobMatchCount} matches
                </Badge>
                <Badge variant="outline">
                  {latestHistory.topScore
                    ? `${Math.round(latestHistory.topScore)}%`
                    : "N/A"}
                </Badge>
              </div>
            </div>
          ) : historyQuery.isLoading ? null : (
            <p className="mt-4 text-muted-foreground text-sm">
              Belum ada analisis tersimpan.
            </p>
          )}
          {historyQuery.error ? (
            <p className="mt-4 text-destructive text-sm">
              {historyQuery.error instanceof Error
                ? historyQuery.error.message
                : "Riwayat belum bisa dimuat."}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
