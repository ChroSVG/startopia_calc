import type { ColumnDef } from "@tanstack/react-table"

import type { InventoryItemModel as InventoryItem } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical } from "lucide-react"
import DeleteFromInventory from "./DeleteFromInventory"

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "item_uid",
    header: "Item ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.item_uid.slice(0, 8)}...
      </span>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "created_at",
    header: "Added",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DeleteFromInventory id={row.original.uid} onSuccess={() => {}} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]
