import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { Columns3, Search, X } from "lucide-react"
import { Suspense, memo, useCallback, useMemo, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { z } from "zod"

import type { ColumnDef } from "@tanstack/react-table"
import { ItemsService, UsersService } from "@/client"
import AddItem from "@/components/Admin/Items/AddItem"
import { columns } from "@/components/Admin/Items/columns"
import { DataTable } from "@/components/Common/DataTable"
import PendingItems from "@/components/Pending/PendingItems"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

const searchSchema = z.object({
  search: z.string().catch(""),
  page: z.coerce.number().int().min(0).catch(0),
  pageSize: z.coerce.number().int().min(1).catch(50),
})

type SearchParams = z.infer<typeof searchSchema>

function getItemsQueryOptions() {
  return {
    queryFn: () => ItemsService.readItems({ skip: 0, limit: 2000 }),
    queryKey: ["admin-items"],
  }
}

export const Route = createFileRoute("/_layout/admin-items")({
  component: AdminItems,
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const user = await UsersService.readUserMe()
    if (!user.is_superuser) {
      throw redirect({ to: "/" })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Admin Items - Startopia Calc",
      },
    ],
  }),
})

const columnLabel = (col: ColumnDef<any>): string => {
  if (typeof col.header === "string") return col.header
  if (col.id) return col.id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  return ""
}

const FilterBar = memo(function FilterBar({
  search,
  onSearchChange,
  columnVisibility,
  setColumnVisibility,
}: {
  search: string
  onSearchChange: (value: string) => void
  columnVisibility: Record<string, boolean>
  setColumnVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  const [inputValue, setInputValue] = useState(search)

  const debouncedSearch = useDebouncedCallback(
    (value: string) => onSearchChange(value),
    300,
  )

  const handleChange = (v: string) => {
    setInputValue(v)
    if (!v) {
      debouncedSearch.cancel()
      onSearchChange("")
    } else {
      debouncedSearch(v)
    }
  }

  const handleClear = () => {
    setInputValue("")
    debouncedSearch.cancel()
    onSearchChange("")
  }

  const toggleableColumns = columns.filter(
    (c): c is typeof c & { id: string } =>
      !!c.id && !!(c.meta as Record<string, unknown> | undefined)?.toggleable,
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          className="pl-8"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 size-6"
            onClick={handleClear}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Columns3 className="size-4" />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {toggleableColumns.map((col) => (
            <DropdownMenuCheckboxItem
              key={col.id}
              checked={columnVisibility[col.id] !== false}
              onCheckedChange={(checked) =>
                setColumnVisibility((prev) => ({ ...prev, [col.id]: checked }))
              }
            >
              {columnLabel(col)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
})

function AdminItemsContent() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { search: searchParam, page, pageSize } = Route.useSearch()
  const { data: items } = useSuspenseQuery(getItemsQueryOptions())

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const col of columns) {
      const meta = col.meta as Record<string, unknown> | undefined
      if (col.id && meta?.toggleable) {
        initial[col.id] = meta.defaultHidden !== true
      }
    }
    return initial
  })

  const filtered = useMemo(() => {
    if (!searchParam) return items.data
    const q = searchParam.toLowerCase()
    return items.data.filter((item) => item.name.toLowerCase().includes(q))
  }, [items.data, searchParam])

  const handleSearchChange = useCallback(
    (v: string) =>
      navigate({
        search: (prev: SearchParams) => ({ ...prev, search: v, page: 0 }),
        replace: true,
      }),
    [navigate],
  )

  if (items.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No items in the database</h3>
        <p className="text-muted-foreground">Add a new growtopia item to get started</p>
    </div>
  )
}

  return (
    <>
      <FilterBar
        search={searchParam}
        onSearchChange={handleSearchChange}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <h3 className="text-lg font-semibold">No results for "{searchParam}"</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search terms</p>
          <Button
            variant="outline"
            onClick={() =>
              navigate({
                search: (prev: SearchParams) => ({ ...prev, search: "", page: 0 }),
                replace: true,
              })
            }
          >
            Clear search
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          pagination={{ pageIndex: page, pageSize }}
          onPaginationChange={(p) =>
            navigate({
              search: (prev: SearchParams) => ({ ...prev, page: p.pageIndex, pageSize: p.pageSize }),
            })
          }
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
        />
      )}
    </>
  )
}

function AdminItems() {
  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Items</h1>
          <p className="text-muted-foreground">
            Manage growtopia item catalog
          </p>
        </div>
        <AddItem />
      </div>
      <Suspense fallback={<PendingItems />}>
        <AdminItemsContent />
      </Suspense>
    </div>
  )
}
