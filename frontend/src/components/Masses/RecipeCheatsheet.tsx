import { useQuery } from "@tanstack/react-query"
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
  Plus,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  type IngredientItemModel,
  ItemsService,
} from "@/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { cn } from "@/lib/utils"
import { findMinTreesForTarget } from "@/utils/massCalculator"
import type { CalculatorItem } from "@/utils/massTypes"

interface IngredientRequirement {
  treeCount: number
  seeds: number
}

function itemRarity(rarity: string | null): number {
  return parseInt(rarity ?? "1", 10)
}

function itemMaxBlocks(maxDrop: number | null | undefined): number {
  return Math.max(1, Math.min(4, Math.floor((maxDrop ?? 4) / 4)))
}

// Removed buildRequirements and buildIngredientReqs since we compute them on the fly

function TreeRow({
  uid,
  nodes,
  adjacency,
  depth,
  path,
  parentRequiredCrafts,
  targetSeeds,
  mode,
  clickedPaths,
  readOnly,
  onAddItem,
  onRemoveItem,
  onApplyTrees,
}: {
  uid: string
  nodes: Record<string, IngredientItemModel>
  adjacency: Record<string, string[]>
  depth: number
  path: string
  parentRequiredCrafts: number
  targetSeeds: number
  mode: string
  clickedPaths: Set<string>
  readOnly?: boolean
  onAddItem?: (path: string, item: IngredientItemModel) => void
  onRemoveItem?: (path: string) => void
  onApplyTrees?: (path: string, treeCount: number) => void
}) {
  const [localExpanded, setLocalExpanded] = useState(depth < 1)
  const item = nodes[uid]
  const childrenUids = adjacency[uid] ?? []
  
  const filteredChildren = childrenUids.filter((c) => !!nodes[c])

  let requirement: IngredientRequirement | null = null
  let nextRequiredCrafts = parentRequiredCrafts

  if (item?.rarity) {
    if (path === "root") {
      if (targetSeeds > 0) {
        requirement = findMinTreesForTarget(
          itemRarity(item.rarity),
          itemMaxBlocks(item.max_drop),
          targetSeeds,
          mode,
        )
        nextRequiredCrafts = requirement.treeCount
      }
    } else {
      if (parentRequiredCrafts > 0) {
        requirement = findMinTreesForTarget(
          itemRarity(item.rarity),
          itemMaxBlocks(item.max_drop),
          parentRequiredCrafts,
          mode,
        )
        nextRequiredCrafts = requirement.treeCount
      }
    }
  }

  // Effect to automatically apply trees to the global state when requirement changes
  useEffect(() => {
    if (!readOnly && onApplyTrees && requirement) {
      // Small delay to avoid dispatching during render
      const timer = setTimeout(() => {
        onApplyTrees(path, requirement!.treeCount)
      }, 0)
      return () => clearTimeout(timer)
    } else if (!readOnly && onApplyTrees && targetSeeds === 0 && path === "root") {
      const timer = setTimeout(() => {
        onApplyTrees("root", 0)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [requirement?.treeCount, path, readOnly, onApplyTrees, targetSeeds])

  // Render all nodes, regardless of rarity. If they don't have rarity, they won't compute requirements.

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
          onClick={
            readOnly
              ? undefined
              : () => {
                  if (isClicked) {
                    onRemoveItem?.(path)
                  } else {
                    onAddItem?.(path, item)
                    if (requirement) {
                      onApplyTrees?.(path, requirement.treeCount)
                    }
                  }
                }
          }
        >
          <ChevronsUpDown
            className={cn(
              "size-3 shrink-0",
              isClicked ? "text-primary" : "text-muted-foreground/50",
            )}
          />
          <span
            className={cn(
              "text-sm truncate flex-1",
              isClicked && "text-primary font-medium",
            )}
          >
            {item.name}
          </span>
          {item.rarity && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
              {item.rarity}
            </Badge>
          )}
          {isClicked ? (
            <Check className="size-3.5 shrink-0 text-primary" />
          ) : (
            <Plus className="size-3.5 shrink-0 text-muted-foreground/60" />
          )}
        </button>

        {requirement && (
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {requirement.treeCount} trees → {requirement.seeds.toLocaleString()}{" "}
            seeds
          </span>
        )}
      </div>

      {localExpanded && filteredChildren.length > 0 && (
        <div>
          {filteredChildren.map((childUid, i) => (
            <TreeRow
              key={`${path}/${i}`}
              uid={childUid}
              nodes={nodes}
              adjacency={adjacency}
              depth={depth + 1}
              path={`${path}/${i}`}
              parentRequiredCrafts={nextRequiredCrafts}
              targetSeeds={targetSeeds}
              mode={mode}
              clickedPaths={clickedPaths}
              onAddItem={onAddItem}
              onRemoveItem={onRemoveItem}
              onApplyTrees={onApplyTrees}
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
  mode,
  targetSeeds,
  onAddItem,
  onRemoveItem,
  onApplyTrees,
}: {
  itemUid: string | null
  items: CalculatorItem[]
  mode: string
  targetSeeds: number
  onAddItem?: (path: string, item: IngredientItemModel) => void
  onRemoveItem?: (path: string) => void
  onApplyTrees?: (path: string, treeCount: number) => void
}) {
  const clickedPaths = useMemo(() => {
    const paths = new Set(
      items.filter((i) => i.sourcePath).map((i) => i.sourcePath!),
    )
    paths.add("root")
    return paths
  }, [items])

  const { data, isLoading, isError } = useQuery({
    queryKey: ["item-ingredients", itemUid],
    queryFn: () => ItemsService.readItemIngredients({ itemUid: itemUid! }),
    enabled: !!itemUid,
    retry: 2,
    staleTime: 30_000,
  })

  // Requirements effect is moved into TreeRow

  if (!itemUid) return null

  const rootUid = data?.root_uid ?? null
  const nodes = data?.nodes ?? {}
  const adjacency = data?.adjacency ?? {}

  const totalDisplay = useMemo(() => {
    return Object.keys(nodes).filter((uid) => uid !== rootUid).length
  }, [nodes, rootUid])

  const totalClicked = useMemo(() => {
    const calcUids = new Set(items.map((i) => i.itemUid).filter(Boolean))
    return Object.keys(nodes).filter(
      (uid) => uid !== rootUid && calcUids.has(uid)
    ).length
  }, [nodes, items, rootUid])

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold">Ingredients</CardTitle>
          {!isLoading && rootUid && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {totalClicked > 0
                ? `${totalClicked}/${totalDisplay}`
                : totalDisplay}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-3 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive italic py-2 px-2">
            Failed to load ingredients.
          </p>
        ) : !rootUid || totalDisplay === 0 ? (
          <p className="text-sm text-muted-foreground italic py-2 px-2">
            No ingredients found.
          </p>
        ) : (
          <div className="space-y-0.5">
            <TreeRow
              uid={rootUid}
              nodes={nodes}
              adjacency={adjacency}
              depth={0}
              path="root"
              parentRequiredCrafts={0}
              targetSeeds={targetSeeds}
              mode={mode}
              clickedPaths={clickedPaths}
              readOnly
              onAddItem={onAddItem}
              onRemoveItem={onRemoveItem}
              onApplyTrees={onApplyTrees}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecipeCheatsheet
