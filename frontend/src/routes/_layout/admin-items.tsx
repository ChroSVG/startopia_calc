import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useCallback, useMemo, useState } from "react"
import { z } from "zod"

import { ItemsService, UsersService } from "@/client"
import AddItem from "@/components/Admin/Items/AddItem"
import { columns } from "@/components/Admin/Items/columns"
import { FilterBar } from "@/components/Admin/Items/FilterBar"
import { Button } from "@/components/ui/button"
import ItemCard from "@/components/Admin/Items/ItemCard"
import { DataTable } from "@/components/Common/DataTable"
import { Pagination } from "@/components/ui/Pagination"
import { getUniqueValues } from "@/utils/adminItemUtils"
import PendingItems from "@/components/Pending/PendingItems"

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
    meta: [{ title: "Admin Items - Startopia Calc" }],
  }),
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

  const handlePageChange = useCallback(
    (p: number) =>
      navigate({
        search: (prev: SearchParams) => ({ ...prev, page: p }),
        replace: true,
      }),
    [navigate],
  )

  const handlePageSizeChange = useCallback(
    (ps: number) =>
      navigate({
        search: (prev: SearchParams) => ({ ...prev, pageSize: ps, page: 0 }),
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
          <Pagination
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
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
