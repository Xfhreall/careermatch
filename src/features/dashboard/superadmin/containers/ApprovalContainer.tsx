import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type ColumnDef } from "@tanstack/react-table"
import { CheckIcon, XIcon, EyeIcon } from "lucide-react"

import {
  fetchSuperadminSnapshot,
  updateHrdApprovalRequest,
} from "@/features/platform/api-client"
import type { SuperadminSnapshot } from "@/features/platform/types"
import { DataTable } from "@/shared/components/DataTable"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"

type ApprovalItem = SuperadminSnapshot["hrdApprovalQueue"][number]

function statusVariant(status: string): "default" | "secondary" | "destructive" {
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
          <Button variant="ghost" size="icon-xs" aria-label="Lihat detail">
            <EyeIcon className="size-3.5" />
          </Button>
          {isPending && (
            <>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Setujui"
                onClick={() => handleApproval(item.id, "Approved")}
              >
                <CheckIcon className="size-3.5 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Tolak"
                onClick={() => handleApproval(item.id, "Rejected")}
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

let handleApproval: (id: string, status: "Approved" | "Rejected") => void = () => {}

export function SuperadminApprovalContainer() {
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

  handleApproval = (id: string, status: "Approved" | "Rejected") => {
    approvalMutation.mutate({
      id,
      status: status === "Approved" ? "approved" : "rejected",
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-medium text-2xl">Approval HRD</h1>
        <p className="text-muted-foreground text-sm">
          Kelola permintaan registrasi akun HRD.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={snapshotQuery.data?.hrdApprovalQueue ?? []}
        loading={snapshotQuery.isLoading}
        searchPlaceholder="Cari berdasarkan perusahaan atau email..."
        emptyTitle="Tidak ada permintaan"
        emptyDescription="Belum ada permintaan registrasi HRD."
      />
    </div>
  )
}
