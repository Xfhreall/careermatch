import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ActivityIcon,
  CheckCircle2Icon,
  CheckIcon,
  CoinsIcon,
  CpuIcon,
  GaugeIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"

import {
  fetchSuperadminSnapshot,
  updateHrdApprovalRequest,
} from "@/features/platform/api-client"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import { Progress } from "@/shared/components/shadcn/ui/progress"

const monitoringIcons = [
  UsersIcon,
  GaugeIcon,
  ActivityIcon,
  ShieldCheckIcon,
  CheckCircle2Icon,
  CpuIcon,
  CoinsIcon,
] as const

function getRoleBadge(role: string) {
  const label =
    role === "hrd" ? "HRD" : role.charAt(0).toUpperCase() + role.slice(1)
  switch (role) {
    case "superadmin":
      return (
        <Badge
          className="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
          variant="outline"
        >
          {label}
        </Badge>
      )
    case "hrd":
      return (
        <Badge
          className="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          variant="outline"
        >
          {label}
        </Badge>
      )
    default:
      return (
        <Badge
          className="border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400"
          variant="outline"
        >
          {label}
        </Badge>
      )
  }
}

function getStatusBadge(status: string) {
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  switch (status) {
    case "active":
      return (
        <Badge
          className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          variant="outline"
        >
          {label}
        </Badge>
      )
    case "pending":
      return (
        <Badge
          className="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          variant="outline"
        >
          {label}
        </Badge>
      )
    case "rejected":
    case "suspended":
      return <Badge variant="destructive">{label}</Badge>
    default:
      return <Badge variant="secondary">{label}</Badge>
  }
}

export function SuperadminMonitoringContainer() {
  const queryClient = useQueryClient()
  const snapshotQuery = useQuery({
    queryFn: fetchSuperadminSnapshot,
    queryKey: ["superadmin-snapshot"],
  })
  const approvalMutation = useMutation({
    mutationFn: updateHrdApprovalRequest,
    onSuccess: (payload) => {
      queryClient.setQueryData(["superadmin-snapshot"], payload)
    },
  })
  const snapshot = snapshotQuery.data
  const approvals = snapshot?.hrdApprovalQueue ?? []
  const auditEvents = snapshot?.auditEvents ?? []
  const hrdJobs = snapshot?.jobs ?? []
  const managedUsers = snapshot?.managedUsers ?? []
  const modelConfig = snapshot?.modelConfig ?? []
  const monitoringCards = snapshot?.monitoringCards ?? []
  const scoringWeights = snapshot?.scoringWeights ?? []

  function updateApproval(id: string, status: "Approved" | "Rejected") {
    approvalMutation.mutate({
      id,
      status: status === "Approved" ? "approved" : "rejected",
    })
  }

  return (
    <main className="paper-grid min-h-dvh bg-background">
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {monitoringCards.map((card, index) => {
          const Icon = monitoringIcons[index % monitoringIcons.length]

          return (
            <div
              className="rounded-lg border border-border bg-card p-6"
              key={card.title}
            >
              <Icon aria-hidden="true" className="size-5" />
              <p className="mt-6 text-muted-foreground text-sm">{card.title}</p>
              <p className="mt-2 font-medium text-4xl">{card.value}</p>
              <p className="mt-2 text-muted-foreground text-sm">{card.label}</p>
            </div>
          )
        })}
      </section>
      {snapshotQuery.error ? (
        <p className="mx-auto max-w-7xl px-4 pb-6 text-destructive text-sm sm:px-6 lg:px-8">
          {snapshotQuery.error instanceof Error
            ? snapshotQuery.error.message
            : "Dashboard superadmin belum bisa dimuat."}
        </p>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-border border-b p-6">
            <p className="text-muted-foreground text-sm">HRD approvals</p>
            <h2 className="font-medium text-3xl">Registration queue</h2>
          </div>
          <div className="divide-y divide-border">
            {approvals.map((approval) => (
              <div
                className="grid gap-4 p-5 md:grid-cols-[1fr_auto]"
                key={approval.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{approval.company}</p>
                    <Badge variant="outline">{approval.id}</Badge>
                    <Badge
                      className={
                        approval.status === "Approved"
                          ? "bg-accent text-accent-foreground"
                          : undefined
                      }
                      variant={
                        approval.status === "Pending" ? "secondary" : "outline"
                      }
                    >
                      {approval.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {approval.email}
                  </p>
                </div>
                <div className="flex gap-2 md:justify-end">
                  <Button
                    disabled={approvalMutation.isPending}
                    onClick={() => updateApproval(approval.id, "Approved")}
                    size="sm"
                    variant="outline"
                  >
                    <CheckIcon aria-hidden="true" data-icon="inline-start" />
                    Approve
                  </Button>
                  <Button
                    disabled={approvalMutation.isPending}
                    onClick={() => updateApproval(approval.id, "Rejected")}
                    size="sm"
                    variant="ghost"
                  >
                    <XIcon aria-hidden="true" data-icon="inline-start" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-border border-b p-6">
            <p className="text-muted-foreground text-sm">User management</p>
            <h2 className="font-medium text-3xl">Accounts by role</h2>
          </div>
          <div className="divide-y divide-border">
            {managedUsers.map(([id, name, role, status]) => (
              <div className="grid gap-3 p-5 md:grid-cols-[1fr_auto]" key={id}>
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="mt-1 text-muted-foreground text-sm">{id}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  {getRoleBadge(role)}
                  {getStatusBadge(status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-border border-b p-6">
              <div className="flex items-center gap-3">
                <SlidersHorizontalIcon aria-hidden="true" className="size-5" />
                <h2 className="font-medium text-3xl">Scoring weights</h2>
              </div>
            </div>
            <div className="grid gap-5 p-6">
              {scoringWeights.map((item) => (
                <div key={item.key}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="font-medium">{item.label}</span>
                    <Badge variant="outline">{item.weight}%</Badge>
                  </div>
                  <Progress value={item.weight} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="border-border border-b p-6">
              <p className="text-muted-foreground text-sm">Model AI</p>
              <h2 className="font-medium text-3xl">Agent configuration</h2>
            </div>
            <div className="divide-y divide-border">
              {modelConfig.map((item) => (
                <div className="p-5" key={item.key}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.agent}</p>
                    <Badge className="bg-accent text-accent-foreground">
                      {item.model}
                    </Badge>
                  </div>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {item.purpose}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-border border-b p-6">
              <p className="text-muted-foreground text-sm">All job postings</p>
              <h2 className="font-medium text-3xl">Platform jobs</h2>
            </div>
            <div className="divide-y divide-border">
              {hrdJobs.map((job) => (
                <div className="p-5" key={job.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{job.title}</p>
                    <Badge variant="outline">{job.company}</Badge>
                    <Badge className="bg-accent text-accent-foreground">
                      {job.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {job.skills.join(", ")} - min {job.minYears} tahun
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="border-border border-b p-6">
              <p className="text-muted-foreground text-sm">Audit log</p>
              <h2 className="font-medium text-3xl">Recent platform events</h2>
            </div>
            <div className="divide-y divide-border">
              {auditEvents.map(([time, event, detail]) => (
                <div
                  className="grid gap-3 p-5 md:grid-cols-[80px_1fr]"
                  key={event}
                >
                  <span className="text-muted-foreground text-sm">{time}</span>
                  <div>
                    <p className="font-medium">{event}</p>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
