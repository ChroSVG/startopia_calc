import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  LayoutGrid,
  Search,
  Table2,
  X,
} from "lucide-react"
import {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useDebouncedCallback } from "use-debounce"
import { z } from "zod"
import { ItemsService, UsersService } from "@/client"
import AddItem from "@/components/Admin/Items/AddItem"
import { columns } from "@/components/Admin/Items/columns"
import ItemCard from "@/components/Admin/Items/ItemCard"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const searchSchema = z.object({
  search: z.string().catch(""),
  type: z.string().catch(""),
  rarity: z.string().catch(""),
  chi: z.string().catch(""),
  view: z.enum(["table", "card"]).catch("table"),
  page: z.coerce.number().int().min(0).catch(0),
  pageSize: z.coerce.number().int().min(1).catch(50),
})

type SearchParams = z.infer<typeof searchSchema>


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

function getUniqueValues<T>(
  items: T[],
  extract: (item: T) => string | null | undefined,
): string[] {
  const set = new Set<string>()
  for (const item of items) {
    const v = extract(item)
    if (v) set.add(v)
  }
  return Array.from(set).sort()
}

const columnLabel = <T,>(col: ColumnDef<T>): string => {
  if (typeof col.header === "string") return col.header
  if (col.id)
    return col.id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  return ""
}

const FilterBar = memo(function FilterBar({
  search,
  onSearchChange,
  typeFilter,
  rarityFilter,
  chiFilter,
  onTypeFilterChange,
  onRarityFilterChange,
  onChiFilterChange,
  typeOptions,
  rarityOptions,
  chiOptions,
  columnVisibility,
  setColumnVisibility,
  viewMode,
  onViewModeChange,
}: {
  search: string
  onSearchChange: (value: string) => void
  typeFilter: string
  rarityFilter: string
  chiFilter: string
  onTypeFilterChange: (value: string) => void
  onRarityFilterChange: (value: string) => void
  onChiFilterChange: (value: string) => void
  typeOptions: string[]
  rarityOptions: string[]
  chiOptions: string[]
  columnVisibility: Record<string, boolean>
  setColumnVisibility: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >
  viewMode: "table" | "card"
  onViewModeChange: (mode: "table" | "card") => void
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

  useEffect(() => {
    setInputValue(search)
  }, [search])

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
      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {typeOptions.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={rarityFilter} onValueChange={onRarityFilterChange}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Rarity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Rarities</SelectItem>
          {rarityOptions.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={chiFilter} onValueChange={onChiFilterChange}>
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue placeholder="Chi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Chi</SelectItem>
          {chiOptions.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Columns3 className="size-4" />
            <span className="hidden sm:inline">Columns</span>
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
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5"
        onClick={() =>
          onViewModeChange(viewMode === "table" ? "card" : "table")
        }
      >
        {viewMode === "table" ? (
          <LayoutGrid className="size-4" />
        ) : (
          <Table2 className="size-4" />
        )}
        <span className="hidden sm:inline">
          {viewMode === "table" ? "Cards" : "Table"}
        </span>
      </Button>
    </div>
  )
})

function AdminItemsContent() {
  const navigate = useNavigate({ from: Route.fullPath })
  const {
    search: searchParam,
    type: typeFilter,
    rarity: rarityFilter,
    chi: chiFilter,
    view: viewMode,
    page,
    pageSize,
  } = Route.useSearch()
  const { data: items } = useSuspenseQuery({
    queryFn: () => ItemsService.readItems({ skip: 0, limit: 2000 }),
    queryKey: ["admin-items"],
  })

  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {}
    for (const col of columns) {
      const meta = col.meta as Record<string, unknown> | undefined
      if (col.id && meta?.toggleable) {
        initial[col.id] = meta.defaultHidden !== true
      }
    }
    return initial
  })

  const typeOptions = useMemo(
    () => getUniqueValues(items.data, (i) => i.type),
    [items.data],
  )
  const rarityOptions = useMemo(
    () => getUniqueValues(items.data, (i) => i.rarity),
    [items.data],
  )
  const chiOptions = useMemo(
    () => getUniqueValues(items.data, (i) => i.chi),
    [items.data],
  )

  const filtered = useMemo(() => {
    let result = items.data
    if (searchParam) {
      const q = searchParam.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(q))
    }
    if (typeFilter) {
      result = result.filter((item) => item.type === typeFilter)
    }
    if (rarityFilter) {
      result = result.filter((item) => item.rarity === rarityFilter)
    }
    if (chiFilter) {
      result = result.filter((item) => item.chi === chiFilter)
    }
    return result
  }, [items.data, searchParam, typeFilter, rarityFilter, chiFilter])

  const handleSearchChange = useCallback(
    (v: string) =>
      navigate({
        search: (prev: SearchParams) => ({ ...prev, search: v, page: 0 }),
        replace: true,
      }),
    [navigate],
  )

  const handleFilterChange = useCallback(
    (key: "type" | "rarity" | "chi", value: string) =>
      navigate({
        search: (prev: SearchParams) => ({
          ...prev,
          [key]: value === "all" ? "" : value,
          page: 0,
        }),
        replace: true,
      }),
    [navigate],
  )

  const handleViewModeChange = useCallback(
    (mode: "table" | "card") =>
      navigate({
        search: (prev: SearchParams) => ({ ...prev, view: mode }),
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
        <p className="text-muted-foreground">
          Add a new growtopia item to get started
        </p>
      </div>
    )
  }

  return (
    <>
      <FilterBar
        search={searchParam}
        onSearchChange={handleSearchChange}
        typeFilter={typeFilter}
        rarityFilter={rarityFilter}
        chiFilter={chiFilter}
        onTypeFilterChange={(v) => handleFilterChange("type", v)}
        onRarityFilterChange={(v) => handleFilterChange("rarity", v)}
        onChiFilterChange={(v) => handleFilterChange("chi", v)}
        typeOptions={typeOptions}
        rarityOptions={rarityOptions}
        chiOptions={chiOptions}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <h3 className="text-lg font-semibold">
            No results for "{searchParam}"
          </h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter terms
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                navigate({
                  search: (prev: SearchParams) => ({
                    ...prev,
                    search: "",
                    type: "",
                    rarity: "",
                    chi: "",
                    page: 0,
                  }),
                  replace: true,
                })
              }
            >
              Clear all filters
            </Button>
          </div>
        </div>
      ) : viewMode === "card" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered
              .slice(page * pageSize, (page + 1) * pageSize)
              .map((item) => (
                <ItemCard key={item.uid} item={item} />
              ))}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border p-4 bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {filtered.length > 0 ? (
                  <>
                    Showing{" "}
                    {Math.min(page * pageSize + 1, filtered.length)} to{" "}
                    {Math.min((page + 1) * pageSize, filtered.length)} of{" "}
                    <span className="font-medium text-foreground">
                      {filtered.length}
                    </span>{" "}
                    entries
                  </>
                ) : (
                  <span className="font-medium text-foreground">
                    0 entries
                  </span>
                )}
              </div>
              <div className="flex items-center gap-x-2">
                <p className="text-sm text-muted-foreground">Rows per page</p>
                <Select
                  value={`${pageSize}`}
                  onValueChange={(value) =>
                    navigate({
                      search: (prev: SearchParams) => ({
                        ...prev,
                        pageSize: Number(value),
                        page: 0,
                      }),
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-auto min-w-[70px]">
                    <SelectValue placeholder={pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 25, 50, 100, filtered.length].map((ps) => (
                      <SelectItem key={ps} value={`${ps}`}>
                        {ps === filtered.length ? "All" : ps}
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
                  {page + 1}
                </span>
                <span>of</span>
                <span className="font-medium text-foreground">
                  {Math.max(1, Math.ceil(filtered.length / pageSize))}
                </span>
              </div>
              <div className="flex items-center gap-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    navigate({
                      search: (prev: SearchParams) => ({
                        ...prev,
                        page: 0,
                      }),
                    })
                  }
                  disabled={page === 0}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    navigate({
                      search: (prev: SearchParams) => ({
                        ...prev,
                        page: page - 1,
                      }),
                    })
                  }
                  disabled={page === 0}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    navigate({
                      search: (prev: SearchParams) => ({
                        ...prev,
                        page: page + 1,
                      }),
                    })
                  }
                  disabled={(page + 1) * pageSize >= filtered.length}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    navigate({
                      search: (prev: SearchParams) => ({
                        ...prev,
                        page: Math.ceil(filtered.length / pageSize) - 1,
                      }),
                    })
                  }
                  disabled={(page + 1) * pageSize >= filtered.length}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          pagination={{ pageIndex: page, pageSize }}
          onPaginationChange={(p) =>
            navigate({
              search: (prev: SearchParams) => ({
                ...prev,
                page: p.pageIndex,
                pageSize: p.pageSize,
              }),
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
          <p className="text-muted-foreground">Manage growtopia item catalog</p>
        </div>
        <AddItem />
      </div>
      <Suspense fallback={<PendingItems />}>
        <AdminItemsContent />
      </Suspense>
    </div>
  )
}
