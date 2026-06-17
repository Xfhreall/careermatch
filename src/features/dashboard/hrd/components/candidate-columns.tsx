import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import type { AnonymousCandidateRecord } from "@/shared/repository/platform/dto"

export const hrdCandidateColumns: ColumnDef<AnonymousCandidateRecord>[] = [
  {
    accessorKey: "role",
    header: "Posisi",
    cell: ({ row }) => row.getValue("role"),
  },
  {
    accessorKey: "candidate",
    header: "Kandidat",
    cell: ({ row }) => {
      const candidate = row.original
      return (
        <div className="space-y-1">
          <p className="font-medium">{candidate.name}</p>
          <p className="text-muted-foreground text-xs">{candidate.email}</p>
          <p className="text-muted-foreground text-xs">{candidate.candidate}</p>
        </div>
      )
    },
  },
  {
    accessorKey: "skills",
    header: "Keahlian",
    cell: ({ row }) => {
      const skills = (row.getValue("skills") as string)
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
      return (
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{skills.length - 3}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "score",
    header: "Skor",
    cell: ({ row }) => {
      const score = row.getValue("score") as string
      return <Badge variant="default">{score}</Badge>
    },
  },
]
