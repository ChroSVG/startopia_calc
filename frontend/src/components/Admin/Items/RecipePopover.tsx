import { useQuery } from "@tanstack/react-query"
import { FlaskConical, Loader2 } from "lucide-react"
import { useState } from "react"
import type { IngredientItemModel, ItemModel } from "@/client"
import { ItemsService } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function ItemList({
  items,
  label,
}: {
  items: Array<IngredientItemModel | ItemModel>
  label: string
}) {
  if (items.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No {label.toLowerCase()}.
      </p>
    )
  }
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {items.map((item) => (
        <div
          key={item.uid}
          className="flex items-center gap-2 py-1 px-1.5 rounded bg-muted/50"
        >
          <span className="text-sm flex-1 truncate">{item.name}</span>
          {item.rarity && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              {item.rarity}
            </Badge>
          )}
        </div>
      ))}
    </div>
  )
}

function RecipePopover({ item }: { item: ItemModel }) {
  const [open, setOpen] = useState(false)

  const { data: ingData, isLoading: ingLoading } = useQuery({
    queryKey: ["item-ingredients-direct", item.uid],
    queryFn: async () => {
      const res = await ItemsService.readItemIngredients({ itemUid: item.uid })
      return (res.root.ingredients ?? [])
        .filter((c) => c.item.rarity)
        .map((c) => c.item)
    },
    enabled: open,
  })

  const { data: posData, isLoading: posLoading } = useQuery({
    queryKey: ["item-possibilities", item.uid],
    queryFn: () =>
      ItemsService.readItemPossibilities({ itemUid: item.uid }).then(
        (r) => r.possibilities,
      ),
    enabled: open,
  })

  if (!item.uid) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7">
          <FlaskConical className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold mb-1">{item.name}</p>
          </div>
          {ingLoading || posLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <ItemList items={ingData ?? []} label="Recipe (crafted from)" />
              <ItemList
                items={posData ?? []}
                label="Possibilities (crafts into)"
              />
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default RecipePopover
