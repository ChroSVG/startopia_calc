import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InventoryToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  filter: string
  onFilterChange: (value: string) => void
  viewMode: "table" | "grid"
  onViewModeChange: (mode: "table" | "grid") => void
}

export function InventoryToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  viewMode,
  onViewModeChange,
}: InventoryToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border">
      <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
        <div className="relative flex-1 max-w-sm min-w-[200px]">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search items by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 size-7 hover:bg-muted"
              onClick={() => onSearchChange("")}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        <Select value={filter} onValueChange={onFilterChange}>
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
          onClick={() => onViewModeChange("table")}
        >
          <List className="size-4" />
          <span className="sr-only">Table View</span>
        </Button>
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="icon"
          className="size-8"
          onClick={() => onViewModeChange("grid")}
        >
          <LayoutGrid className="size-4" />
          <span className="sr-only">Card View</span>
        </Button>
      </div>
    </div>
  )
}
