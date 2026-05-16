import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import * as React from "react"

import { Badge } from "@/shared/components/shadcn/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/shadcn/ui/table"

import type { JobMatch } from "../types"

const columnHelper = createColumnHelper<JobMatch>()

export function JobMatchesTable({ jobs }: { jobs: JobMatch[] }) {
  const columns = React.useMemo(
    () => [
      columnHelper.display({
        id: "rank",
        header: "#",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {String(row.index + 1).padStart(2, "0")}
          </span>
        ),
      }),
      columnHelper.accessor("jobTitle", {
        header: "Posisi",
        cell: ({ row }) => (
          <div className="flex min-w-[220px] flex-col gap-1">
            <span className="font-medium">{row.original.jobTitle}</span>
            <span className="text-muted-foreground text-xs">
              {row.original.company}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("compatibilityScore", {
        header: "Match",
        cell: (info) => (
          <span className="inline-flex min-w-16 items-center justify-center rounded-md bg-accent px-3 py-1 font-medium text-accent-foreground">
            {formatScore(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("matchedSkills", {
        header: "Skill cocok",
        cell: (info) => <SkillList skills={info.getValue()} />,
      }),
      columnHelper.accessor("skillGap", {
        header: "Skill gap",
        cell: (info) => (
          <SkillList skills={info.getValue()} variant="outline" />
        ),
      }),
      columnHelper.display({
        id: "experience",
        header: "Pengalaman",
        cell: ({ row }) => {
          const required = row.original.requiredYears
          const candidate = row.original.candidateYears ?? 0

          if (required === undefined) {
            return <span className="text-muted-foreground">-</span>
          }

          return (
            <span className="text-sm">
              {candidate} / {required} tahun
            </span>
          )
        },
      }),
    ],
    []
  )
  const table = useReactTable({
    columns,
    data: jobs,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function SkillList({
  skills,
  variant = "secondary",
}: {
  skills: string[]
  variant?: "secondary" | "outline"
}) {
  if (skills.length === 0) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <div className="flex min-w-[180px] flex-wrap gap-1.5">
      {skills.slice(0, 5).map((skill) => (
        <Badge key={skill} variant={variant}>
          {skill}
        </Badge>
      ))}
      {skills.length > 5 ? (
        <Badge variant="outline">+{skills.length - 5}</Badge>
      ) : null}
    </div>
  )
}

function formatScore(score: number | undefined) {
  if (score === undefined) {
    return "-"
  }

  return `${Math.round(score)}%`
}
