import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { SaveIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import {
  fetchSuperadminSnapshot,
  updateSuperadminModelConfig,
  updateSuperadminScoringConfig,
} from "@/features/platform/api-client"
import type {
  ModelConfigRecord,
  ScoringConfigRecord,
} from "@/features/platform/types"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import { Input } from "@/shared/components/shadcn/ui/input"
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
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-medium text-2xl">Konfigurasi Model</h1>
        <p className="text-muted-foreground text-sm">
          Pengaturan model AI dan bobot scoring dari database produksi.
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

function ModelConfigRow({ item }: { item: ModelConfigRecord }) {
  const queryClient = useQueryClient()
  const [model, setModel] = React.useState(item.model)
  const [purpose, setPurpose] = React.useState(item.purpose)
  const mutation = useMutation({
    mutationFn: updateSuperadminModelConfig,
    onSuccess: (payload) => {
      queryClient.setQueryData(["superadmin-snapshot"], payload)
      toast.success("Konfigurasi model tersimpan.")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Konfigurasi gagal disimpan."
      )
    },
  })
  const isDirty = model !== item.model || purpose !== item.purpose

  React.useEffect(() => {
    setModel(item.model)
    setPurpose(item.purpose)
  }, [item.model, item.purpose])

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <span>{item.agent}</span>
          <span className="text-muted-foreground text-xs">{item.key}</span>
        </div>
      </TableCell>
      <TableCell>
        <Input
          aria-label={`Model ${item.agent}`}
          className="min-w-40"
          onChange={(event) => setModel(event.target.value)}
          value={model}
        />
      </TableCell>
      <TableCell>
        <Input
          aria-label={`Purpose ${item.agent}`}
          className="min-w-64"
          onChange={(event) => setPurpose(event.target.value)}
          value={purpose}
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          disabled={!isDirty || mutation.isPending}
          onClick={() =>
            mutation.mutate({
              key: item.key,
              model,
              purpose,
            })
          }
          size="sm"
          variant="outline"
        >
          <SaveIcon aria-hidden="true" data-icon="inline-start" />
          Simpan
        </Button>
      </TableCell>
    </TableRow>
  )
}

function ScoringConfigRow({ item }: { item: ScoringConfigRecord }) {
  const queryClient = useQueryClient()
  const [weight, setWeight] = React.useState(String(item.weight))
  const mutation = useMutation({
    mutationFn: updateSuperadminScoringConfig,
    onSuccess: (payload) => {
      queryClient.setQueryData(["superadmin-snapshot"], payload)
      toast.success("Bobot scoring tersimpan.")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Bobot gagal disimpan."
      )
    },
  })
  const parsedWeight = Number(weight)
  const isValid =
    Number.isFinite(parsedWeight) && parsedWeight >= 0 && parsedWeight <= 100
  const isDirty = parsedWeight !== item.weight

  React.useEffect(() => {
    setWeight(String(item.weight))
  }, [item.weight])

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <span>{item.label}</span>
          <span className="text-muted-foreground text-xs">{item.key}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Input
            aria-label={`Bobot ${item.label}`}
            className="w-28"
            max={100}
            min={0}
            onChange={(event) => setWeight(event.target.value)}
            type="number"
            value={weight}
          />
          <Badge variant={isValid ? "outline" : "destructive"}>%</Badge>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          disabled={!isValid || !isDirty || mutation.isPending}
          onClick={() =>
            mutation.mutate({
              key: item.key,
              weight: Math.round(parsedWeight),
            })
          }
          size="sm"
          variant="outline"
        >
          <SaveIcon aria-hidden="true" data-icon="inline-start" />
          Simpan
        </Button>
      </TableCell>
    </TableRow>
  )
}
