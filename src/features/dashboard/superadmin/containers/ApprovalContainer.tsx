import type { ColumnDef } from "@tanstack/react-table"
import { CheckIcon, EyeIcon, XIcon } from "lucide-react"
import * as React from "react"
import {
  useSuperadminSnapshotQuery,
  useUpdateHrdApprovalMutation,
} from "@/features/dashboard/superadmin/hooks/use-superadmin-dashboard"
import { DataTable } from "@/shared/components/DataTable"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/ui/dialog"
import type { SuperadminSnapshot } from "@/shared/repository/platform/dto"

type ApprovalItem = SuperadminSnapshot["hrdApprovalQueue"][number]

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "Approved":
      return "default"
    case "Pending":
      return "secondary"
    case "Rejected":
      return "destructive"
    default:
      return "secondary"
  }
}

export function SuperadminApprovalContainer() {
  const [selectedApproval, setSelectedApproval] =
    React.useState<ApprovalItem | null>(null)
  const snapshotQuery = useSuperadminSnapshotQuery()
  const approvalMutation = useUpdateHrdApprovalMutation()

  function handleApproval(id: string, status: "Approved" | "Rejected") {
    approvalMutation.mutate({
      id,
      status: status === "Approved" ? "approved" : "rejected",
    })
  }

  const columns: ColumnDef<ApprovalItem>[] = [
    {
      accessorKey: "company",
      header: "Perusahaan",
      cell: ({ row }) => row.getValue("company"),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.getValue("email"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return <Badge variant={statusVariant(status)}>{status}</Badge>
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const item = row.original
        const isPending = item.status === "Pending"

        return (
          <div className="flex items-center gap-1">
            <Button
              aria-label="Lihat detail"
              onClick={() => setSelectedApproval(item)}
              size="icon-xs"
              variant="ghost"
            >
              <EyeIcon className="size-3.5" />
            </Button>
            {isPending && (
              <>
                <Button
                  aria-label="Setujui"
                  disabled={approvalMutation.isPending}
                  onClick={() => handleApproval(item.id, "Approved")}
                  size="icon-xs"
                  variant="ghost"
                >
                  <CheckIcon className="size-3.5 text-accent-foreground" />
                </Button>
                <Button
                  aria-label="Tolak"
                  disabled={approvalMutation.isPending}
                  onClick={() => handleApproval(item.id, "Rejected")}
                  size="icon-xs"
                  variant="ghost"
                >
                  <XIcon className="size-3.5 text-destructive" />
                </Button>
              </>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-medium text-2xl">Approval HRD</h1>
        <p className="text-muted-foreground text-sm">
          Kelola permintaan registrasi akun HRD dari database.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={snapshotQuery.data?.hrdApprovalQueue ?? []}
        emptyDescription="Belum ada permintaan registrasi HRD."
        emptyTitle="Tidak ada permintaan"
        loading={snapshotQuery.isLoading}
        searchPlaceholder="Cari berdasarkan perusahaan atau email..."
      />

      <Dialog
        onOpenChange={(open) => !open && setSelectedApproval(null)}
        open={Boolean(selectedApproval)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedApproval?.company}</DialogTitle>
            <DialogDescription>{selectedApproval?.email}</DialogDescription>
          </DialogHeader>
          {selectedApproval ? (
            <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-muted-foreground text-sm">Approval ID</p>
                <p className="mt-1 font-medium">{selectedApproval.id}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-muted-foreground text-sm">Status</p>
                <Badge
                  className="mt-2"
                  variant={statusVariant(selectedApproval.status)}
                >
                  {selectedApproval.status}
                </Badge>
              </div>
              {selectedApproval.description && (
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-muted-foreground text-sm">
                    Deskripsi / Alasan
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-foreground text-sm">
                    {selectedApproval.description}
                  </p>
                </div>
              )}
              {selectedApproval.supportingFileName &&
              selectedApproval.supportingFileUrl ? (
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-muted-foreground text-sm">
                    Dokumen Pendukung
                  </p>
                  <div className="mt-2 text-sm">
                    <a
                      href={selectedApproval.supportingFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                    >
                      <EyeIcon className="size-4" />
                      {selectedApproval.supportingFileName}
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
