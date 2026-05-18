import { useQuery } from "@tanstack/react-query"

import { fetchSuperadminSnapshot } from "@/features/platform/api-client"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/shadcn/ui/table"

export function SuperadminModelConfigContainer() {
  const snapshotQuery = useQuery({
    queryFn: fetchSuperadminSnapshot,
    queryKey: ["superadmin-snapshot"],
  })

  const modelConfig = snapshotQuery.data?.modelConfig ?? []
  const scoringWeights = snapshotQuery.data?.scoringWeights ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-medium text-2xl">Konfigurasi Model</h1>
        <p className="text-muted-foreground text-sm">
          Pengaturan model AI dan bobot scoring untuk pencocokan CV.
        </p>
      </div>

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {modelConfig.map(([key, value, description]) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{key}</TableCell>
                <TableCell>
                  <Badge variant="outline">{value}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {description}
                </TableCell>
              </TableRow>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {scoringWeights.map(([key, weight]) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{key}</TableCell>
                <TableCell>
                  <Badge>{Math.round(weight * 100)}%</Badge>
                </TableCell>
              </TableRow>
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
