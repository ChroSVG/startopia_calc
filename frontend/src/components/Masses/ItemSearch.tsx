import { useQuery } from "@tanstack/react-query"
import { Loader2, Search, X } from "lucide-react"
import { useState } from "react"
import { useDebounce } from "use-debounce"
import { type ItemModel, ItemsService } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function ItemSearch({
  onSelect,
  onClear,
  selectedName,
  compact,
}: {
  onSelect: (item: ItemModel) => void
  onClear: () => void
  selectedName?: string
  compact?: boolean
}) {
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 400)
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ["admin-items", debouncedSearch],
    queryFn: () =>
      ItemsService.readItems({
        search: debouncedSearch || undefined,
        limit: 20,
      }),
    enabled: open,
  })

  const items = itemsData?.data ?? []

  const inputClass = compact ? "pl-7 h-7 text-xs" : "pl-7 h-8 text-sm"
  const iconClass = compact ? "size-3" : "size-3.5"

  if (selectedName) {
    return (
      <div className="relative">
        <div className="relative">
          <Input
            value={selectedName}
            readOnly
            className={inputClass}
            onKeyDown={(e) => {
              if (e.key === "Backspace" || e.key === "Delete") {
                e.preventDefault()
                onClear()
              }
            }}
          />
          <Search className={`absolute left-2 top-1/2 -translate-y-1/2 ${iconClass} text-muted-foreground pointer-events-none`} />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={onClear}
          >
            <X className={compact ? "size-2.5" : "size-3"} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className={`absolute left-2 top-1/2 -translate-y-1/2 ${iconClass} text-muted-foreground pointer-events-none`} />
        <Input
          placeholder="Search item..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setHighlightedIndex(-1)
            if (!open) setOpen(true)
          }}
          onFocus={() => {
            setOpen(true)
            setHighlightedIndex(-1)
          }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setHighlightedIndex((prev) => Math.min(prev + 1, items.length - 1))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setHighlightedIndex((prev) => Math.max(prev - 1, 0))
            } else if (e.key === "Enter" && highlightedIndex >= 0 && items[highlightedIndex]) {
              e.preventDefault()
              onSelect(items[highlightedIndex])
              setSearch("")
              setOpen(false)
            } else if (e.key === "Escape") {
              setOpen(false)
            }
          }}
          className={inputClass}
        />
      </div>
      {open && search && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No items found.
            </p>
          ) : (
            items.map((item, index) => (
              <button
                key={item.uid}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors",
                  index === highlightedIndex
                    ? "bg-accent"
                    : "hover:bg-accent",
                )}
                onMouseDown={() => {
                  onSelect(item)
                  setSearch("")
                  setOpen(false)
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="flex-1 truncate">{item.name}</span>
                {item.rarity && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 shrink-0"
                  >
                    {item.rarity}
                  </Badge>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ItemSearch
