import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react"
import { Suspense, useMemo, useState } from "react"

import { InventoryService, ItemsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddToInventory from "@/components/Inventory/AddToInventory"
import { columns } from "@/components/Inventory/columns"
import DeleteFromInventory from "@/components/Inventory/DeleteFromInventory"
import PendingItems from "@/components/Pending/PendingItems"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function getInventoryQueryOptions() {
  return {
    queryFn: () => InventoryService.readInventory({ skip: 0, limit: 100 }),
    queryKey: ["inventory"],
  }
}

function getItemsQueryOptions() {
  return {
    queryFn: () => ItemsService.readItems({ skip: 0, limit: 2000 }),
    queryKey: ["admin-items"],
  }
}

export const Route = createFileRoute("/_layout/inventory")({
  component: Inventory,
  head: () => ({
    meta: [
      {
        title: "Inventory - Startopia Calc",
      },
    ],
  }),
})

function InventoryContent() {
  const { data: inventory } = useSuspenseQuery(getInventoryQueryOptions())
  const { data: itemsData } = useSuspenseQuery(getItemsQueryOptions())

  const items = itemsData?.data ?? []

  // UI / UX state
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all") // all, in-stock, out-of-stock
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  // Augment inventory data with item details
  const augmentedData = useMemo(() => {
    return inventory.data.map((invItem) => {
      const itemInfo = items.find((item) => item.uid === invItem.item_uid)
      return {
        ...invItem,
        item_name: itemInfo?.name ?? "Unknown Item",
        item_type: itemInfo?.type ?? "Unknown",
        item_rarity: itemInfo?.rarity ?? "",
        item_description: itemInfo?.description ?? "",
      }
    })
  }, [inventory.data, items])

  // Filter in memory
  const filteredData = useMemo(() => {
    return augmentedData.filter((invItem) => {
      // 1. Search name filter
      const matchesSearch = invItem.item_name
        .toLowerCase()
        .includes(search.toLowerCase())

      // 2. Status filter
      let matchesFilter = true
      if (filter === "in-stock") {
        matchesFilter = invItem.quantity > 0
      } else if (filter === "out-of-stock") {
        matchesFilter = invItem.quantity === 0
      }

      return matchesSearch && matchesFilter
    })
  }, [augmentedData, search, filter])

  const handleClearSearch = () => {
    setSearch("")
    setFilter("all")
  }

  if (inventory.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 border rounded-xl bg-card">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold">Your inventory is empty</h3>
        <p className="text-muted-foreground mb-6">
          Add items to your inventory to get started
        </p>
        <AddToInventory />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search items by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 size-7 hover:bg-muted"
                onClick={() => setSearch("")}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px] bg-background">
              <SlidersHorizontal className="size-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 border rounded-lg p-1 bg-background">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            className="size-8"
            onClick={() => setViewMode("table")}
          >
            <List className="size-4" />
            <span className="sr-only">Table View</span>
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="size-8"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="size-4" />
            <span className="sr-only">Card View</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 border rounded-xl bg-card">
          <h3 className="text-lg font-semibold">No results found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          <Button variant="outline" onClick={handleClearSearch}>
            Clear Filters
          </Button>
        </div>
      ) : viewMode === "table" ? (
        <div className="border rounded-xl overflow-hidden bg-card">
          <DataTable columns={columns} data={filteredData} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredData.map((invItem) => (
            <Card
              key={invItem.uid}
              className="overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold leading-tight">
                      {invItem.item_name}
                    </CardTitle>
                    {invItem.item_type && (
                      <Badge variant="outline" className="text-[10px]">
                        {invItem.item_type}
                      </Badge>
                    )}
                  </div>
                  {invItem.item_rarity && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] shrink-0 font-medium"
                    >
                      {invItem.item_rarity}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4 pt-2 grow">
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                  {invItem.item_description || "No description available."}
                </p>
                <div className="flex items-center justify-between text-xs bg-muted/50 p-2.5 rounded-lg">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-bold text-sm">{invItem.quantity}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-3 border-t bg-muted/10 flex items-center justify-between px-4 h-11">
                <span className="text-[10px] text-muted-foreground">
                  Added {new Date(invItem.created_at).toLocaleDateString()}
                </span>
                <DeleteFromInventory id={invItem.uid} onSuccess={() => {}} asButton />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Inventory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Your collected items</p>
        </div>
        <Suspense fallback={null}>
          <AddToInventoryWrapper />
        </Suspense>
      </div>
      <Suspense fallback={<PendingItems />}>
        <InventoryContent />
      </Suspense>
    </div>
  )
}

function AddToInventoryWrapper() {
  const { data: inventory } = useSuspenseQuery(getInventoryQueryOptions())
  if (inventory.data.length === 0) return null
  return <AddToInventory />
}
