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
  type RecipeTreeNode,
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

function buildRequirements(
  node: RecipeTreeNode,
  path: string,
  targetSeeds: number,
  mode: string,
  map: Map<string, IngredientRequirement>,
): void {
  if (!node.item.rarity) {
    for (let i = 0; i < (node.ingredients ?? []).length; i++) {
      buildRequirements(
        (node.ingredients ?? [])[i],
        `${path}/${i}`,
        targetSeeds,
        mode,
        map,
      )
    }
    return
  }

  if (path === "root") {
    const r = findMinTreesForTarget(
      itemRarity(node.item.rarity),
      itemMaxBlocks(node.item.max_drop),
      targetSeeds,
      mode,
    )
    map.set(path, { treeCount: r.treeCount, seeds: r.seeds })

    const requiredCrafts = r.treeCount
    for (let i = 0; i < (node.ingredients ?? []).length; i++) {
      buildIngredientReqs(
        (node.ingredients ?? [])[i],
        `${path}/${i}`,
        requiredCrafts,
        mode,
        map,
      )
    }
  }
}

function buildIngredientReqs(
  node: RecipeTreeNode,
  path: string,
  requiredCrafts: number,
  mode: string,
  map: Map<string, IngredientRequirement>,
): void {
  if (!node.item.rarity) {
    for (let i = 0; i < (node.ingredients ?? []).length; i++) {
      buildIngredientReqs(
        (node.ingredients ?? [])[i],
        `${path}/${i}`,
        requiredCrafts,
        mode,
        map,
      )
    }
    return
  }

  const r = findMinTreesForTarget(
    itemRarity(node.item.rarity),
    itemMaxBlocks(node.item.max_drop),
    requiredCrafts,
    mode,
  )
  map.set(path, { treeCount: r.treeCount, seeds: r.seeds })

  for (let i = 0; i < (node.ingredients ?? []).length; i++) {
    buildIngredientReqs(
      (node.ingredients ?? [])[i],
      `${path}/${i}`,
      requiredCrafts,
      mode,
      map,
    )
  }
}

function TreeRow({
  node,
  depth,
  path,
  clickedPaths,
  requirementsMap,
  readOnly,
  onAddItem,
  onRemoveItem,
  onApplyTrees,
}: {
  node: RecipeTreeNode
  depth: number
  path: string
  clickedPaths: Set<string>
  requirementsMap: Map<string, IngredientRequirement>
  readOnly?: boolean
  onAddItem?: (path: string, item: IngredientItemModel) => void
  onRemoveItem?: (path: string) => void
  onApplyTrees?: (path: string, treeCount: number) => void
}) {
  const [localExpanded, setLocalExpanded] = useState(depth < 1)
  const filteredChildren = (node.ingredients ?? []).filter((c) => c.item.rarity)

  if (!node.item.rarity) {
    return filteredChildren.map((child, i) => (
      <TreeRow
        key={`${path}/${i}`}
        node={child}
        depth={depth}
        path={`${path}/${i}`}
        clickedPaths={clickedPaths}
        requirementsMap={requirementsMap}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onApplyTrees={onApplyTrees}
      />
    ))
  }

  const isClicked = readOnly || clickedPaths.has(path)
  const requirement = requirementsMap.get(path)

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
                    onAddItem?.(path, node.item)
                    const req = requirementsMap.get(path)
                    if (req) {
                      onApplyTrees?.(path, req.treeCount)
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
            {node.item.name}
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
            {node.item.rarity}
          </Badge>
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
          {filteredChildren.map((child, i) => (
            <TreeRow
              key={`${path}/${i}`}
              node={child}
              depth={depth + 1}
              path={`${path}/${i}`}
              clickedPaths={clickedPaths}
              requirementsMap={requirementsMap}
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

  const requirements = useMemo(() => {
    const map = new Map<string, IngredientRequirement>()
    const root = data?.root
    if (root && targetSeeds > 0) {
      buildRequirements(root, "root", targetSeeds, mode, map)
    }
    return map
  }, [data, targetSeeds, mode])

  useEffect(() => {
    if (targetSeeds === 0) {
      onApplyTrees?.("root", 0)
    } else {
      for (const [path, req] of requirements) {
        onApplyTrees?.(path, req.treeCount)
      }
    }
  }, [requirements, targetSeeds, onApplyTrees])

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
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold">Ingredients</CardTitle>
          {!isLoading && root && (
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
              requirementsMap={requirements}
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

function countAll(node: RecipeTreeNode): number {
  let count = 0
  for (const child of node.ingredients ?? []) {
    if (child.item.rarity) {
      count += 1 + countAll(child)
    } else {
      count += countAll(child)
    }
  }
  return count
}

export default RecipeCheatsheet
