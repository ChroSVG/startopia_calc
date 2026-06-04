import { Columns3, LayoutGrid, Search, Table2, X } from "lucide-react"
import { memo, useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"

import { columns } from "@/components/Admin/Items/columns"
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
import { columnLabel } from "@/utils/adminItemUtils"

interface FilterBarProps {
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
}

export const FilterBar = memo(function FilterBar({
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
}: FilterBarProps) {
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
