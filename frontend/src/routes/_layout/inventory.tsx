import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { InventoryService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddToInventory from "@/components/Inventory/AddToInventory"
import { columns } from "@/components/Inventory/columns"
import PendingItems from "@/components/Pending/PendingItems"

function getInventoryQueryOptions() {
  return {
    queryFn: () => InventoryService.readInventory({ skip: 0, limit: 100 }),
    queryKey: ["inventory"],
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

function InventoryTableContent() {
  const { data: inventory } = useSuspenseQuery(getInventoryQueryOptions())

  if (inventory.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Your inventory is empty</h3>
        <p className="text-muted-foreground">Add items to your inventory to get started</p>
      </div>
    )
  }

  return <DataTable columns={columns} data={inventory.data} />
}

function InventoryTable() {
  return (
    <Suspense fallback={<PendingItems />}>
      <InventoryTableContent />
    </Suspense>
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
        <AddToInventory />
      </div>
      <InventoryTable />
    </div>
  )
}
