import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SaveIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/shadcn/ui/field"
import { Input } from "@/shared/components/shadcn/ui/input"
import { Switch } from "@/shared/components/shadcn/ui/switch"
import { TableCell, TableRow } from "@/shared/components/shadcn/ui/table"
import {
  updateSuperadminModelConfig,
  updateSuperadminPlatformSetting,
  updateSuperadminScoringConfig,
} from "@/shared/repository/platform/action"
import type {
  ModelConfigRecord,
  PlatformSettingRecord,
  ScoringConfigRecord,
} from "@/shared/repository/platform/dto"

export const CHATBOT_GUARD_SETTING_KEY = "chatbot_guard_enabled"

export function ChatbotGuardSetting({
  setting,
}: {
  setting?: PlatformSettingRecord
}) {
  const queryClient = useQueryClient()
  const enabled = setting?.value ?? true
  const mutation = useMutation({
    mutationFn: updateSuperadminPlatformSetting,
    onSuccess: (payload) => {
      queryClient.setQueryData(["superadmin-snapshot"], payload)
      toast.success("Aturan guard chatbot tersimpan.")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Aturan guard chatbot gagal disimpan."
      )
    },
  })

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Field className="gap-1">
          <div className="flex items-center gap-2">
            <FieldLabel htmlFor="chatbot-guard-enabled">
              Chatbot guard rule
            </FieldLabel>
            <Badge variant={enabled ? "outline" : "secondary"}>
              {enabled ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
          <FieldDescription>
            Aktifkan untuk memfilter pesan di luar konteks CareerMatch sebelum
            dikirim ke webhook. Nonaktifkan jika ingin percakapan chatbot lebih
            bebas saat testing atau demo.
          </FieldDescription>
        </Field>
        <Switch
          aria-label="Aktifkan chatbot guard rule"
          checked={enabled}
          disabled={mutation.isPending}
          id="chatbot-guard-enabled"
          onCheckedChange={(checked) =>
            mutation.mutate({
              key: setting?.key ?? CHATBOT_GUARD_SETTING_KEY,
              value: checked,
            })
          }
        />
      </div>
    </div>
  )
}

export function ModelConfigRow({ item }: { item: ModelConfigRecord }) {
  const queryClient = useQueryClient()
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
  const form = useForm({
    defaultValues: {
      model: item.model,
      purpose: item.purpose,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        key: item.key,
        model: value.model,
        purpose: value.purpose,
      })
    },
  })
  const values = form.state.values
  const isDirty = values.model !== item.model || values.purpose !== item.purpose

  React.useEffect(() => {
    form.setFieldValue("model", item.model)
    form.setFieldValue("purpose", item.purpose)
  }, [form, item.model, item.purpose])

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <span>{item.agent}</span>
          <span className="text-muted-foreground text-xs">{item.key}</span>
        </div>
      </TableCell>
      <TableCell>
        <form.Field name="model">
          {(field) => (
            <Input
              aria-label={`Model ${item.agent}`}
              className="min-w-40"
              onChange={(event) => field.handleChange(event.target.value)}
              value={field.state.value}
            />
          )}
        </form.Field>
      </TableCell>
      <TableCell>
        <form.Field name="purpose">
          {(field) => (
            <Input
              aria-label={`Purpose ${item.agent}`}
              className="min-w-64"
              onChange={(event) => field.handleChange(event.target.value)}
              value={field.state.value}
            />
          )}
        </form.Field>
      </TableCell>
      <TableCell className="text-right">
        <Button
          disabled={!isDirty || mutation.isPending}
          onClick={() => void form.handleSubmit()}
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

export function ScoringConfigRow({ item }: { item: ScoringConfigRecord }) {
  const queryClient = useQueryClient()
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
  const form = useForm({
    defaultValues: {
      weight: String(item.weight),
    },
    onSubmit: async ({ value }) => {
      const parsedWeight = Number(value.weight)
      mutation.mutate({
        key: item.key,
        weight: Math.round(parsedWeight),
      })
    },
  })
  const parsedWeight = Number(form.state.values.weight)
  const isValid =
    Number.isFinite(parsedWeight) && parsedWeight >= 0 && parsedWeight <= 100
  const isDirty = parsedWeight !== item.weight

  React.useEffect(() => {
    form.setFieldValue("weight", String(item.weight))
  }, [form, item.weight])

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
          <form.Field name="weight">
            {(field) => (
              <Input
                aria-label={`Bobot ${item.label}`}
                className="w-28"
                max={100}
                min={0}
                onChange={(event) => field.handleChange(event.target.value)}
                type="number"
                value={field.state.value}
              />
            )}
          </form.Field>
          <Badge variant={isValid ? "outline" : "destructive"}>%</Badge>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          disabled={!isValid || !isDirty || mutation.isPending}
          onClick={() => void form.handleSubmit()}
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
