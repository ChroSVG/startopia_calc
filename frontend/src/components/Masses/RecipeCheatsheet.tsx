import { useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronRight, Loader2, Package } from "lucide-react"
import { useState } from "react"
import { ItemsService } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function RecipeCheatsheet({ itemUid }: { itemUid: string | null }) {
  const [expanded, setExpanded] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["item-ingredients", itemUid],
    queryFn: () => ItemsService.readItemIngredients({ itemUid: itemUid! }),
    enabled: !!itemUid,
  })

  const ingredients = (data?.ingredients ?? [])
    .filter((i) => i.rarity)
    .sort((a, b) => Number(b.rarity) - Number(a.rarity))

  if (!itemUid) return null

  return (
    <Card>
      <CardHeader
        className="py-3 px-4 cursor-pointer select-none flex flex-row items-center justify-between"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
          <CardTitle className="text-sm font-semibold">Ingredients</CardTitle>
          {!isLoading && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {ingredients.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="px-4 pb-3 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : ingredients.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">
              No ingredients found.
            </p>
          ) : (
            <div className="space-y-1">
              {ingredients.map((item) => (
                <div
                  key={item.uid}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-muted/50"
                >
                  <Package className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{item.name}</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 shrink-0"
                  >
                    {item.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default RecipeCheatsheet
