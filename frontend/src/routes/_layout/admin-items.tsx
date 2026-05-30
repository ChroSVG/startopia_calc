import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { Search, X } from "lucide-react"
import { Suspense, useMemo } from "react"
import { z } from "zod"

import type { ItemModel as Item } from "@/client"
import { ItemsService, UsersService } from "@/client"
import AddItem from "@/components/Admin/Items/AddItem"
import { columns } from "@/components/Admin/Items/columns"
import { DataTable } from "@/components/Common/DataTable"
import PendingItems from "@/components/Pending/PendingItems"
import { Button } from "@/components/ui/button"
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
  type: z.string().catch("all"),
  chi: z.string().catch("all"),
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

function FilterBar({
  search,
  type,
  chi,
  items,
}: SearchParams & { items: Item[] }) {
  const navigate = useNavigate({ from: Route.fullPath })

  const typeOptions = useMemo(() => {
    const types = new Set<string>()
    for (const item of items) {
      if (item.type) types.add(item.type)
    }
    return [...types].sort()
  }, [items])

  const chiOptions = useMemo(() => {
    const chis = new Set<string>()
    for (const item of items) {
      if (item.chi) chis.add(item.chi)
    }
    return [...chis].sort()
  }, [items])

  const updateParams = (patch: Partial<SearchParams>) => {
    navigate({ search: (prev: SearchParams) => ({ ...prev, ...patch, page: 0 }) })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          className="pl-8"
          value={search}
          onChange={(e) => updateParams({ search: e.target.value })}
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 size-6"
            onClick={() => updateParams({ search: "" })}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
      <Select value={type} onValueChange={(v) => updateParams({ type: v })}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {typeOptions.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={chi} onValueChange={(v) => updateParams({ chi: v })}>
        <SelectTrigger className="h-9 w-[140px]">
          <SelectValue placeholder="All Chi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Chi</SelectItem>
          {chiOptions.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function AdminItemsContent() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { search, type, chi, page, pageSize } = Route.useSearch()
  const { data: items } = useSuspenseQuery(getItemsQueryOptions())

  const filtered = useMemo(() => {
    let result = items.data
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(q))
    }
    if (type !== "all") {
      result = result.filter((item) => item.type === type)
    }
    if (chi !== "all") {
      result = result.filter((item) => item.chi === chi)
    }
    return result
  }, [items.data, search, type, chi])

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
      <FilterBar search={search} type={type} chi={chi} items={items.data} />
      <DataTable
        columns={columns}
        data={filtered}
        pagination={{ pageIndex: page, pageSize }}
        onPaginationChange={(p) =>
          navigate({ search: (prev: SearchParams) => ({ ...prev, page: p.pageIndex, pageSize: p.pageSize }) })
        }
      />
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
