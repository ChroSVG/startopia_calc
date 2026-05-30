import { useMemo, useState } from "react"

import {
  type ColumnDef,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination: controlledPagination,
  onPaginationChange,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
}: DataTableProps<TData, TValue>) {
  const isControlled = controlledPagination != null

  const getDefaultVisibility = () => {
    const initial: Record<string, boolean> = {}
    for (const col of columns) {
      const meta = col.meta as Record<string, unknown> | undefined
      if (meta?.toggleable) {
        initial[col.id!] = meta?.defaultHidden !== true
      }
    }
    return initial
  }

  const [internalVisibility, setInternalVisibility] = useState<Record<string, boolean>>(getDefaultVisibility)

  const columnVisibility = controlledColumnVisibility ?? internalVisibility
  const setColumnVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>> =
    controlledColumnVisibility != null
      ? (updater) => {
          const next =
            typeof updater === "function"
              ? updater(controlledColumnVisibility)
              : updater
          onColumnVisibilityChange?.(next)
        }
      : setInternalVisibility

  const visibleColumns = useMemo(
    () =>
      columns.filter((col) => {
        const meta = col.meta as Record<string, unknown> | undefined
        if (meta?.toggleable) return columnVisibility[col.id!] !== false
        return true
      }),
    [columns, columnVisibility],
  )

  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({})

  const toggleFilter = (colId: string, value: string) => {
    setColumnFilters((prev) => {
      const current = prev[colId] ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [colId]: next.length ? next : [] }
    })
  }

  const clearFilters = (colId: string) => {
    setColumnFilters((prev) => {
      const { [colId]: _, ...rest } = prev
      return rest
    })
  }

  const filteredData = useMemo(() => {
    const active = Object.entries(columnFilters).filter(([, v]) => v.length > 0)
    if (!active.length) return data
    return data.filter((row) =>
      active.every(([colId, selected]) => {
        const col = columns.find((c) => c.id === colId || c.accessorKey === colId)
        if (!col) return true
        const accessorKey = (col as Record<string, unknown>).accessorKey as string | undefined
        const val = accessorKey ? (row as Record<string, unknown>)[accessorKey] : undefined
        return selected.includes(String(val ?? ""))
      }),
    )
  }, [data, columnFilters, columns])

  const getUniqueValues = (colDef: ColumnDef<unknown>) => {
    const accessorKey = (colDef as Record<string, unknown>).accessorKey as string | undefined
    if (!accessorKey) return []
    const vals = new Set<string>()
    for (const row of data) {
      const v = (row as Record<string, unknown>)[accessorKey]
      if (v != null && v !== "") vals.add(String(v))
    }
    return [...vals].sort()
  }

  const table = useReactTable({
    data: filteredData,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(isControlled
      ? {
          state: { pagination: controlledPagination },
          onPaginationChange: (updater) => {
            const next =
              typeof updater === "function"
                ? updater(controlledPagination)
                : updater
            onPaginationChange?.(next)
          },
        }
      : {
          initialState: { pagination: { pageSize: 50 } },
        }),
  })

  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const total = filteredData.length
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const sticky = (header.column.columnDef.meta as Record<string, unknown> | undefined)?.sticky
                return (
                  <TableHead
                    key={header.id}
                    className={cn(sticky && "sticky left-0 z-20 bg-background border-r")}
                  >
                    <div className="inline-flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {(header.column.columnDef.meta as Record<string, unknown> | undefined)?.filterable && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "size-5 -mr-1",
                                columnFilters[header.column.id]?.length
                                  ? "text-primary"
                                  : "text-muted-foreground",
                              )}
                            >
                              <Filter className="size-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                            {getUniqueValues(header.column.columnDef).map((val) => {
                              const checked = columnFilters[header.column.id]?.includes(val) ?? false
                              return (
                                <label
                                  key={val}
                                  className="flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer hover:bg-muted rounded-sm"
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => toggleFilter(header.column.id, val)}
                                  />
                                  {val}
                                </label>
                              )
                            })}
                            {columnFilters[header.column.id]?.length > 0 && (
                              <div className="border-t px-2 py-1 mt-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto text-xs px-0 font-normal"
                                  onClick={() => clearFilters(header.column.id)}
                                >
                                  Clear filter
                                </Button>
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const sticky = (cell.column.columnDef.meta as Record<string, unknown> | undefined)?.sticky
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(sticky && "sticky left-0 z-10 bg-background border-r")}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={visibleColumns.length}
                className="h-32 text-center text-muted-foreground"
              >
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-t bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {total > 0 ? (
                <>Showing {from} to {to} of <span className="font-medium text-foreground">{total}</span> entries</>
              ) : (
                <span className="font-medium text-foreground">0 entries</span>
              )}
            </div>
            <div className="flex items-center gap-x-2">
              <p className="text-sm text-muted-foreground">Rows per page</p>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="h-8 w-auto min-w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 25, 50, 100, filteredData.length].map((ps) => (
                    <SelectItem key={ps} value={`${ps}`}>
                      {ps === filteredData.length ? "All" : ps}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-x-6">
            <div className="flex items-center gap-x-1 text-sm text-muted-foreground">
              <span>Page</span>
              <span className="font-medium text-foreground">
                {table.getState().pagination.pageIndex + 1}
              </span>
              <span>of</span>
              <span className="font-medium text-foreground">
                {table.getPageCount()}
              </span>
            </div>

            <div className="flex items-center gap-x-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
    </div>
  )
}
