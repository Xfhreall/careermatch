import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SearchIcon,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/shared/components/shadcn/ui/button"
import { Input } from "@/shared/components/shadcn/ui/input"
import { Skeleton } from "@/shared/components/shadcn/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/shadcn/ui/table"
import { cn } from "@/shared/lib/utils"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "./shadcn/ui/empty"

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
const SKELETON_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5"]
const SKELETON_CELLS = ["cell-1", "cell-2", "cell-3", "cell-4"]

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

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      globalFilter,
      pagination,
      sorting,
    },
  })

  const filteredRows = table.getFilteredRowModel().rows
  const pageCount = Math.max(table.getPageCount(), 1)
  const hasData = data.length > 0
  const hasFilteredData = filteredRows.length > 0

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
        className
      )}
    >
      <div className="flex flex-col gap-3 border-border border-b bg-secondary/35 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <SearchIcon
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="h-10 bg-card pr-3 pl-9"
            disabled={loading}
            onChange={(event) => {
              const nextFilter = event.target.value
              setGlobalFilter(nextFilter)
              setPagination((currentPagination) => ({
                ...currentPagination,
                pageIndex: 0,
              }))
            }}
            placeholder={searchPlaceholder}
            value={globalFilter}
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-muted-foreground text-sm sm:justify-end">
          <span className="tabular-nums">
            {loading
              ? "Memuat data..."
              : `${filteredRows.length} / ${data.length} baris`}
          </span>
          {hasData ? (
            <label className="flex items-center gap-2">
              <span>Baris</span>
              <select
                className="h-9 rounded-md border border-input bg-card px-2 text-foreground text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                onChange={(event) => {
                  const nextPageSize = Number(event.target.value)
                  setPagination({
                    pageIndex: 0,
                    pageSize: nextPageSize,
                  })
                }}
                value={pagination.pageSize}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="p-4">
          <div className="rounded-lg border border-border">
            {SKELETON_ROWS.map((rowKey) => (
              <div
                className="grid grid-cols-4 gap-4 border-border border-b p-4 last:border-b-0"
                key={rowKey}
              >
                {SKELETON_CELLS.map((cellKey) => (
                  <Skeleton className="h-5" key={`${rowKey}-${cellKey}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : !hasData ? (
        <div className="p-4">
          <Empty className="border-border bg-background/60">
            <EmptyHeader>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <>
          <Table className="min-w-[760px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted()
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <button
                            className={cn(
                              "flex min-h-9 w-full items-center gap-2 rounded-md text-left font-medium transition-colors",
                              header.column.getCanSort()
                                ? "cursor-pointer hover:text-foreground"
                                : "cursor-default"
                            )}
                            disabled={!header.column.getCanSort()}
                            onClick={header.column.getToggleSortingHandler()}
                            type="button"
                          >
                            <span>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            {sorted === "asc" ? (
                              <ArrowUpIcon
                                aria-hidden="true"
                                className="size-3.5"
                              />
                            ) : sorted === "desc" ? (
                              <ArrowDownIcon
                                aria-hidden="true"
                                className="size-3.5"
                              />
                            ) : header.column.getCanSort() ? (
                              <ArrowUpDownIcon
                                aria-hidden="true"
                                className="size-3.5 opacity-45"
                              />
                            ) : null}
                          </button>
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {!hasFilteredData ? (
                <TableRow>
                  <TableCell
                    className="h-32 text-center"
                    colSpan={columns.length}
                  >
                    <div className="mx-auto max-w-sm">
                      <p className="font-medium">Tidak ada hasil yang cocok.</p>
                      <p className="mt-1 text-muted-foreground text-sm">
                        Coba kata kunci lain atau kosongkan kolom pencarian.
                      </p>
                    </div>
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

          <div className="flex flex-col gap-3 border-border border-t bg-secondary/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm tabular-nums">
              Menampilkan {table.getRowModel().rows.length} dari{" "}
              {filteredRows.length} hasil
            </p>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="flex items-center gap-1">
                <Button
                  aria-label="Halaman pertama"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.setPageIndex(0)}
                  size="icon-xs"
                  variant="outline"
                >
                  <ChevronsLeftIcon className="size-3.5" />
                </Button>
                <Button
                  aria-label="Halaman sebelumnya"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  size="icon-xs"
                  variant="outline"
                >
                  <ChevronLeftIcon className="size-3.5" />
                </Button>
              </div>
              <span className="min-w-24 text-center text-muted-foreground text-sm tabular-nums">
                {pagination.pageIndex + 1} / {pageCount}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  aria-label="Halaman selanjutnya"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  size="icon-xs"
                  variant="outline"
                >
                  <ChevronRightIcon className="size-3.5" />
                </Button>
                <Button
                  aria-label="Halaman terakhir"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.setPageIndex(pageCount - 1)}
                  size="icon-xs"
                  variant="outline"
                >
                  <ChevronsRightIcon className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
