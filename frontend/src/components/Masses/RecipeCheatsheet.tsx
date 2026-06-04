import { useQuery } from "@tanstack/react-query"
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
  Plus,
} from "lucide-react"
import { useMemo, useState } from "react"
import { type ItemModel, type RecipeTreeNode, ItemsService } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CalculatorItem } from "@/utils/massTypes"

function TreeRow({
  node,
  depth,
  path,
  clickedPaths,
  readOnly,
  onAddItem,
  onRemoveItem,
}: {
  node: RecipeTreeNode
  depth: number
  path: string
  clickedPaths: Set<string>
  readOnly?: boolean
  onAddItem?: (path: string, item: ItemModel) => void
  onRemoveItem?: (path: string) => void
}) {
  const [localExpanded, setLocalExpanded] = useState(depth < 1)
  const filteredChildren = node.ingredients.filter((c) => c.item.rarity)

  if (!node.item.rarity) {
    return filteredChildren.map((child, i) => (
      <TreeRow
        key={`${path}/${i}`}
        node={child}
        depth={depth}
        path={`${path}/${i}`}
        clickedPaths={clickedPaths}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
      />
    ))
  }

  const isClicked = readOnly || clickedPaths.has(path)

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 py-1 px-2 rounded-md transition-colors",
          isClicked && !readOnly && "bg-primary/10",
          !isClicked && "hover:bg-accent",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {filteredChildren.length > 0 ? (
          <button
            type="button"
            className="size-4 shrink-0 flex items-center justify-center rounded hover:bg-muted transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setLocalExpanded((v) => !v)
            }}
          >
            {localExpanded ? (
              <ChevronDown className="size-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="size-4 shrink-0" />
        )}

        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 flex-1 min-w-0 text-left",
            readOnly && "cursor-default",
          )}
          onClick={readOnly ? undefined : () => {
            if (isClicked) {
              onRemoveItem?.(path)
            } else {
              onAddItem?.(path, node.item)
            }
          }}
        >
          <ChevronsUpDown className={cn(
            "size-3 shrink-0",
            isClicked ? "text-primary" : "text-muted-foreground/50",
          )} />
          <span className={cn(
            "text-sm truncate flex-1",
            isClicked && "text-primary font-medium",
          )}>
            {node.item.name}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 shrink-0"
          >
            {node.item.rarity}
          </Badge>
          {isClicked ? (
            <Check className="size-3.5 shrink-0 text-primary" />
          ) : (
            <Plus className="size-3.5 shrink-0 text-muted-foreground/60" />
          )}
        </button>
      </div>

      {localExpanded && filteredChildren.length > 0 && (
        <div>
          {filteredChildren.map((child, i) => (
            <TreeRow
              key={`${path}/${i}`}
              node={child}
              depth={depth + 1}
              path={`${path}/${i}`}
              clickedPaths={clickedPaths}
              onAddItem={onAddItem}
              onRemoveItem={onRemoveItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RecipeCheatsheet({
  itemUid,
  items,
  onAddItem,
  onRemoveItem,
}: {
  itemUid: string | null
  items: CalculatorItem[]
  onAddItem?: (path: string, item: ItemModel) => void
  onRemoveItem?: (path: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const clickedPaths = useMemo(
    () => {
      const paths = new Set(items.filter((i) => i.sourcePath).map((i) => i.sourcePath!))
      paths.add("root")
      return paths
    },
    [items],
  )

  const { data, isLoading } = useQuery({
    queryKey: ["item-ingredients", itemUid],
    queryFn: () => ItemsService.readItemIngredients({ itemUid: itemUid! }),
    enabled: !!itemUid,
  })

  if (!itemUid) return null

  const root = data?.root ?? null

  const totalDisplay = root
    ? root.item.rarity
      ? 1 + countAll(root)
      : countAll(root)
    : 0

  const totalClicked = clickedPaths.size

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
          {!isLoading && root && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {totalClicked > 0 ? `${totalClicked}/${totalDisplay}` : totalDisplay}
            </Badge>
          )}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="px-2 pb-3 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : !root || totalDisplay === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2 px-2">
              No ingredients found.
            </p>
          ) : (
            <div className="space-y-0.5">
              <TreeRow
                node={root}
                depth={0}
                path="root"
                clickedPaths={clickedPaths}
                readOnly
                onAddItem={onAddItem}
                onRemoveItem={onRemoveItem}
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

function countAll(node: RecipeTreeNode): number {
  let count = 0
  for (const child of node.ingredients) {
    if (child.item.rarity) {
      count += 1 + countAll(child)
    } else {
      count += countAll(child)
    }
  }
  return count
}

export default RecipeCheatsheet
