import { Package, Search, SlidersHorizontal } from "lucide-react"
import * as React from "react"
import AddToInventory from "@/components/Inventory/AddToInventory"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type BackpackItem, BackpackSlot } from "./BackpackSlot"
import { ItemDetailTooltip } from "./ItemDetailTooltip"

interface BackpackGridProps {
  items: BackpackItem[]
  onAddClick?: () => void
}

export const BackpackGrid = ({ items }: BackpackGridProps) => {
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState("all")
  const [sortBy, setSortBy] = React.useState("name")

  // Extract unique types for tabs
  const types = React.useMemo(() => {
    const t = new Set(items.map((item) => item.item_type).filter(Boolean))
    return Array.from(t) as string[]
  }, [items])

  const filteredItems = React.useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch = item.item_name
          .toLowerCase()
          .includes(search.toLowerCase())
        const matchesCategory =
          category === "all" || item.item_type === category
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.item_name.localeCompare(b.item_name)
        if (sortBy === "quantity") return b.quantity - a.quantity
        if (sortBy === "rarity") {
          const rarities = [
            "common",
            "uncommon",
            "rare",
            "epic",
            "legendary",
            "exotic",
          ]
          const aIdx = rarities.indexOf(a.item_rarity?.toLowerCase() || "")
          const bIdx = rarities.indexOf(b.item_rarity?.toLowerCase() || "")
          return bIdx - aIdx
        }
        return 0
      })
  }, [items, search, category, sortBy])

  return (
    <div className="space-y-6">
      {/* Backpack Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-muted/30 p-4 rounded-2xl border-2 border-dashed">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search backpack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/50 border-2 focus-visible:ring-primary/20"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-background/50 border-2">
              <SlidersHorizontal className="size-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="quantity">Quantity</SelectItem>
              <SelectItem value="rarity">Rarity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs
          value={category}
          onValueChange={setCategory}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-background/50 border-2 p-1 h-11">
            <TabsTrigger
              value="all"
              className="px-4 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              ALL
            </TabsTrigger>
            {types.slice(0, 3).map((type) => (
              <TabsTrigger
                key={type}
                value={type}
                className="px-4 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase"
              >
                {type}
              </TabsTrigger>
            ))}
            {types.length > 3 && (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-8 border-none bg-transparent px-2 text-xs font-bold hover:bg-muted">
                  <span className="uppercase">More</span>
                </SelectTrigger>
                <SelectContent>
                  {types.slice(3).map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                      className="uppercase text-[10px] font-bold"
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </TabsList>
        </Tabs>
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 p-1">
        {/* Add Slot */}
        <AddToInventory trigger={<BackpackSlot isAddSlot />} />

        {filteredItems.map((item) => (
          <ItemDetailTooltip key={item.uid} item={item}>
            <BackpackSlot item={item} />
          </ItemDetailTooltip>
        ))}

        {/* Empty Slots to fill the row (optional, but gives a better feel) */}
        {filteredItems.length < 9 &&
          Array.from({ length: 9 - filteredItems.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square w-full rounded-lg border-2 border-muted/20 bg-muted/5 opacity-50"
            />
          ))}
      </div>

      {filteredItems.length === 0 && search && (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/10">
          <Package className="size-12 mx-auto text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-bold text-muted-foreground">
            No items found
          </h3>
          <p className="text-sm text-muted-foreground/60">
            Try a different search term or category
          </p>
        </div>
      )}
    </div>
  )
}
