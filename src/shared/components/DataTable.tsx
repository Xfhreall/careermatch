import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { useForm } from "@tanstack/react-form"
import { ArrowDownIcon, ArrowUpIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react"
import { useState } from "react"

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
import { Skeleton } from "@/shared/components/shadcn/ui/skeleton"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/shared/components/shadcn/ui/empty"
import { cn } from "@/shared/lib/utils"

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  searchPlaceholder?: string
  emptyTitle?: string
  emptyDescription?: string
  pageSizeOptions?: number[]
  className?: string
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  searchPlaceholder = "Cari...",
  emptyTitle = "Tidak ada data",
  emptyDescription = "Belum ada data yang tersedia.",
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const defaultPageSize = pageSizeOptions.includes(10)
    ? 10
    : (pageSizeOptions[0] ?? 10)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const controlsForm = useForm({
    defaultValues: {
      globalFilter,
      pageSize: defaultPageSize,
    },
    onSubmit: async () => {},
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
  })

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-10 w-64" />
        <div className="rounded-lg border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b p-4 last:border-b-0">
              {columns.slice(0, 5).map((_, j) => (
                <Skeleton key={j} className="h-5 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const hasData = data.length > 0
  const hasFilteredData = table.getFilteredRowModel().rows.length > 0

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <controlsForm.Field name="globalFilter">
            {(field) => (
              <Input
                placeholder={searchPlaceholder}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const nextFilter = event.target.value
                  field.handleChange(nextFilter)
                  setGlobalFilter(nextFilter)
                  setPagination((currentPagination) => ({
                    ...currentPagination,
                    pageIndex: 0,
                  }))
                }}
                className="pl-9"
              />
            )}
          </controlsForm.Field>
        </div>
      </div>

      {!hasData ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              header.column.getCanSort() && "cursor-pointer select-none"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <ArrowUpIcon className="size-3.5" />,
                              desc: <ArrowDownIcon className="size-3.5" />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {!hasFilteredData ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Tidak ada hasil yang cocok.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {hasData && (
        <div className="flex flex-col items-center justify-between gap-4 px-2 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            {table.getFilteredRowModel().rows.length} dari {data.length} baris
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Baris:</span>
              <controlsForm.Field name="pageSize">
                {(field) => (
                  <select
                    value={String(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      const nextPageSize = Number(event.target.value)
                      field.handleChange(nextPageSize)
                      setPagination({
                        pageIndex: 0,
                        pageSize: nextPageSize,
                      })
                    }}
                    className="rounded-md border border-input bg-card px-2 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                )}
              </controlsForm.Field>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                aria-label="Halaman pertama"
              >
                <ChevronsLeftIcon className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeftIcon className="size-3.5" />
              </Button>
              <span className="text-muted-foreground text-sm px-2">
                Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
                {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Halaman selanjutnya"
              >
                <ChevronRightIcon className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                aria-label="Halaman terakhir"
              >
                <ChevronsRightIcon className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
