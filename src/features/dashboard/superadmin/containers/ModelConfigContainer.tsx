import { useQuery } from "@tanstack/react-query"

import {
  CHATBOT_GUARD_SETTING_KEY,
  ChatbotGuardSetting,
  ModelConfigRow,
  ScoringConfigRow,
} from "@/features/dashboard/superadmin/components/model-config-rows"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/shadcn/ui/table"
import { fetchSuperadminSnapshot } from "@/shared/repository/platform/action"

export function SuperadminModelConfigContainer() {
  const snapshotQuery = useQuery({
    queryFn: fetchSuperadminSnapshot,
    queryKey: ["superadmin-snapshot"],
  })

  const modelConfig = snapshotQuery.data?.modelConfig ?? []
  const scoringWeights = snapshotQuery.data?.scoringWeights ?? []
  const chatbotGuardSetting = snapshotQuery.data?.platformSettings.find(
    (item) => item.key === CHATBOT_GUARD_SETTING_KEY
  )

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-medium text-2xl">Konfigurasi Model</h1>
        <p className="text-muted-foreground text-sm">
          Pengaturan model AI dan bobot scoring dari database produksi.
        </p>
      </div>

      <ChatbotGuardSetting setting={chatbotGuardSetting} />

      <div className="rounded-lg border border-border bg-card">
        <div className="border-border border-b p-4">
          <h2 className="font-medium text-lg">Parameter Model</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modelConfig.map((item) => (
              <ModelConfigRow item={item} key={item.key} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-border border-b p-4">
          <h2 className="font-medium text-lg">Bobot Scoring</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Komponen</TableHead>
              <TableHead>Bobot</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scoringWeights.map((item) => (
              <ScoringConfigRow item={item} key={item.key} />
            ))}
          </TableBody>
        </Table>
      </div>

      {snapshotQuery.isLoading && (
        <div className="animate-pulse space-y-3">
          <div className="h-40 rounded-lg bg-muted" />
          <div className="h-32 rounded-lg bg-muted" />
        </div>
      )}
    </div>
  )
}
