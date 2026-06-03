import type { ColumnDef } from "@tanstack/react-table"
import { EllipsisVertical } from "lucide-react"
import type { InventoryItemModel as InventoryItem } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteFromInventory from "./DeleteFromInventory"
import EditInventory from "./EditInventory"

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "item_name",
    header: "Item Name",
    cell: ({ row }) => (
      <span className="font-semibold text-sm max-w-[220px] truncate block">
        {(row.original as any).item_name ?? (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.item_uid.slice(0, 8)}...
          </span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "item_type",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {(row.original as any).item_type ?? "—"}
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
            <EditInventory
              itemUid={row.original.uid}
              currentQuantity={row.original.quantity}
              itemName={(row.original as any).item_name ?? "Unknown"}
            />
            <DropdownMenuSeparator />
            <DeleteFromInventory id={row.original.uid} onSuccess={() => {}} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]
