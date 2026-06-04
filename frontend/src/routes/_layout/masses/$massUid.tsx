import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router"
import { ArrowLeft, Loader2, Plus, RotateCcw, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { ItemModel, MassModel } from "@/client"
import { MassesService } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { MassItemResult } from "@/utils/massCalculator"
import { calculateItem, formatDuration } from "@/utils/massCalculator"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import ItemSearch from "@/components/Masses/ItemSearch"

const MODES = [
  { value: "a", label: "Mode A" },
  { value: "b", label: "Mode B" },
  { value: "apresisi", label: "Mode A Presisi" },
  { value: "bpresisi", label: "Mode B Presisi" },
] as const

interface CalculatorItem {
  tempId: string
  itemUid: string | null
  itemName: string
  treeRarity: number
  maxBlocks: number
  jumlahPohon: number
}

interface CalcState {
  uid: string | null
  name: string
  description: string
  mode: string
  items: CalculatorItem[]
}

let tempIdCounter = 0
function nextTempId() {
  tempIdCounter++
  return `temp_${tempIdCounter}`
}

function blankItem(): CalculatorItem {
  return {
    tempId: nextTempId(),
    itemUid: null,
    itemName: "",
    treeRarity: 1,
    maxBlocks: 1,
    jumlahPohon: 0,
  }
}

function massToCalcState(mass: MassModel): CalcState {
  return {
    uid: mass.uid,
    name: mass.name,
    description: mass.description ?? "",
    mode: mass.mode,
    items: (mass.items ?? []).map((i) => ({
      tempId: nextTempId(),
      itemUid: i.item_uid ?? null,
      itemName: i.item_name ?? "",
      treeRarity: i.tree_rarity ?? 1,
      maxBlocks: i.max_blocks ?? 1,
      jumlahPohon: i.jumlah_pohon ?? 0,
    })),
  }
}

export const Route = createFileRoute("/_layout/masses/$massUid")({
  component: MassCalculatorPage,
  head: () => ({
    meta: [{ title: "Mass Calculator - Startopia Calc" }],
  }),
})

function MassCalculatorPage() {
  const { massUid } = useParams({ from: "/_layout/masses/$massUid" })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  if (massUid === "new") {
    navigate({ to: "/masses", replace: true })
    return null
  }

  const { data: loadedMass, isLoading: isLoadingMass } = useQuery({
    queryKey: ["mass", massUid],
    queryFn: () => MassesService.readMass({ massUid }),
  })

  const [state, setState] = useState<CalcState>(() => ({
    uid: null,
    name: "",
    description: "",
    mode: "a",
    items: [blankItem()],
  }))

  useEffect(() => {
    if (loadedMass) {
      tempIdCounter = 0
      setState(massToCalcState(loadedMass))
    }
  }, [loadedMass])

  const update = useCallback(
    (patch: Partial<CalcState>) =>
      setState((prev) => ({ ...prev, ...patch })),
    [],
  )

  const updateItem = useCallback(
    (tempId: string, patch: Partial<CalculatorItem>) =>
      setState((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.tempId === tempId ? { ...i, ...patch } : i,
        ),
      })),
    [],
  )

  const removeItem = useCallback(
    (tempId: string) =>
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.tempId !== tempId),
      })),
    [],
  )

  const addItem = useCallback(
    () =>
      setState((prev) => ({
        ...prev,
        items: [...prev.items, blankItem()],
      })),
    [],
  )

  const resetCalc = useCallback(() => {
    tempIdCounter = 0
    setState((prev) => ({
      ...prev,
      items: [blankItem()],
    }))
  }, [])

  const handleItemSelect = useCallback(
    (tempId: string, item: ItemModel) => {
      const maxBlocks = Math.max(1, Math.min(4, Math.floor((item.max_drop ?? 4) / 4)))
      updateItem(tempId, {
        itemUid: item.uid,
        itemName: item.name,
        treeRarity: parseInt(item.rarity ?? "1", 10),
        maxBlocks,
      })
    },
    [updateItem],
  )

  const resultsCache = useMemo(() => {
    const map = new Map<string, MassItemResult>()
    for (const item of state.items) {
      map.set(
        item.tempId,
        calculateItem(item.treeRarity, item.maxBlocks, item.jumlahPohon, state.mode),
      )
    }
    return map
  }, [state.items, state.mode])

  const totals = useMemo(() => {
    let totalTrees = 0
    let totalBlocks = 0
    let totalSmash = 0
    let totalSeeds = 0
    let totalGems = 0
    let maxGrowSecs = 0

    for (const item of state.items) {
      const r = resultsCache.get(item.tempId)
      if (!r) continue
      totalTrees += item.jumlahPohon
      totalBlocks += r.blok_yielded
      totalSmash += r.total_smash_efektif
      totalSeeds += r.total_seeds_return
      totalGems += r.total_gems_didapat
      if (r.grow_time_seconds > maxGrowSecs) {
        maxGrowSecs = r.grow_time_seconds
      }
    }

    return {
      totalTrees,
      totalBlocks,
      totalSmash,
      totalSeeds,
      totalGems,
      maxGrowSecs,
      growReadable: formatDuration(maxGrowSecs),
    }
  }, [state.items, resultsCache])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: state.name,
        description: state.description || null,
        mode: state.mode,
        items: state.items.map((i) => ({
          item_uid: i.itemUid || undefined,
          item_name: i.itemName || "Item",
          tree_rarity: i.treeRarity,
          max_blocks: i.maxBlocks,
          jumlah_pohon: i.jumlahPohon,
        })),
      }
      if (state.uid) {
        return MassesService.updateMass({
          massUid: state.uid,
          requestBody: payload,
        })
      }
      return MassesService.createMass({ requestBody: payload })
    },
    onSuccess: (data) => {
      showSuccessToast(state.uid ? "Mass updated" : "Mass saved")
      queryClient.invalidateQueries({ queryKey: ["masses"] })
      if (!state.uid) {
        const saved = data as MassModel
        tempIdCounter = 0
        setState(massToCalcState(saved))
        window.location.href = `/masses/${saved.uid}`
      }
    },
    onError: handleError.bind(showErrorToast),
  })

  const hasItems = state.items.some((i) => i.itemUid && i.jumlahPohon > 0)
  const isDirty = state.items.length > 0
  const isValid = hasItems

  if (isLoadingMass) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/masses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {state.name || "Mass Calculator"}
            </h1>
            {state.description && (
              <p className="text-muted-foreground text-sm">{state.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {MODES.find((m) => m.value === state.mode)?.label ?? state.mode.toUpperCase()}
          </Badge>
          <LoadingButton
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
            disabled={!isValid}
            size="sm"
          >
            {state.uid ? "Update" : "Save"}
          </LoadingButton>
          <Button variant="outline" size="sm" onClick={resetCalc} disabled={!isDirty}>
            <RotateCcw className="size-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Label className="text-sm text-muted-foreground shrink-0">Mode</Label>
        <Select value={state.mode} onValueChange={(v) => update({ mode: v })}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODES.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasItems && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold">Totals</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Total Trees</span>
                <p className="font-bold tabular-nums text-lg">
                  {totals.totalTrees.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Total Blocks</span>
                <p className="font-bold tabular-nums text-lg">
                  {totals.totalBlocks.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Total Smash</span>
                <p className="font-bold tabular-nums text-lg">
                  {totals.totalSmash.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Total Seeds</span>
                <p className="font-bold tabular-nums text-lg">
                  {totals.totalSeeds.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Total Gems</span>
                <p className="font-bold tabular-nums text-lg">
                  {totals.totalGems.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Max Grow</span>
                <p className="font-bold tabular-nums text-lg">
                  {totals.growReadable}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Items</h2>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="size-4 mr-1" />
          Add Item
        </Button>
      </div>

      {state.items.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No items yet. Add at least one item with trees to see calculations.
        </p>
      )}

      <div className="space-y-3">
        {state.items.map((item) => {
          const result = resultsCache.get(item.tempId)
          return (
            <Card key={item.tempId} className="relative">
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Item</Label>
                    <ItemSearch
                      selectedName={item.itemName || undefined}
                      onSelect={(i) => handleItemSelect(item.tempId, i)}
                      onClear={() =>
                        updateItem(item.tempId, {
                          itemUid: null,
                          itemName: "",
                          treeRarity: 1,
                          maxBlocks: 1,
                        })
                      }
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Max Blocks</Label>
                    <Input
                      type="number"
                      min={1}
                      max={4}
                      value={item.maxBlocks}
                      disabled
                      className="h-8"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Trees</Label>
                    <Input
                      type="number"
                      min={0}
                      value={item.jumlahPohon || ""}
                      onChange={(e) =>
                        updateItem(item.tempId, {
                          jumlahPohon: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      placeholder="0"
                      className="h-8"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end pb-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.tempId)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {item.itemUid && result && (
                <CardContent className="px-4 pb-3 pt-0">
                  <Separator className="mb-2" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Blok</span>
                      <p className="font-medium tabular-nums">
                        {result.blok_yielded.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Smash</span>
                      <p className="font-medium tabular-nums">
                        {result.total_smash_efektif.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Seeds</span>
                      <p className="font-medium tabular-nums">
                        {result.total_seeds_return.toLocaleString()}{" "}
                        <span className="text-muted-foreground">
                          ({result.seed_return_rate}%)
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gems</span>
                      <p className="font-medium tabular-nums">
                        {result.total_gems_didapat.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Grow</span>
                      <p className="font-medium tabular-nums">
                        {result.grow_time_readable}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gems/Block</span>
                      <p className="font-medium tabular-nums">
                        {result.avg_gems_per_block}
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

    </div>
  )
}
