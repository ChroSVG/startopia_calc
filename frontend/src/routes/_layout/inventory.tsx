import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useMemo, useState } from "react"

import AddToInventory from "@/components/Inventory/AddToInventory"
import { InventoryCardGrid } from "@/components/Inventory/InventoryCardGrid"
import { InventoryToolbar } from "@/components/Inventory/InventoryToolbar"
import { DataTable } from "@/components/Common/DataTable"
import { columns } from "@/components/Inventory/columns"
import PendingItems from "@/components/Pending/PendingItems"
import { Button } from "@/components/ui/button"
import { useAugmentedInventory } from "@/hooks/useAugmentedInventory"

export const Route = createFileRoute("/_layout/inventory")({
  component: Inventory,
  head: () => ({
    meta: [{ title: "Inventory - Startopia Calc" }],
  }),
})

function InventoryContent() {
  const { inventory, augmentedData } = useAugmentedInventory()

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  const filteredData = useMemo(() => {
    return augmentedData.filter((invItem) => {
      const matchesSearch = invItem.item_name
        .toLowerCase()
        .includes(search.toLowerCase())

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

  if (inventory.length === 0) {
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
      <InventoryToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

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
        <InventoryCardGrid items={filteredData} />
      )}
    </div>
  )
}

function AddToInventoryWrapper() {
  const { inventory } = useAugmentedInventory()
  if (inventory.length === 0) return null
  return <AddToInventory />
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
