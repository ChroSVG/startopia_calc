import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { MassesService } from "@/client"
import { MassCalcHeader } from "@/components/Masses/MassCalcHeader"
import { MassItemCard } from "@/components/Masses/MassItemCard"
import { ModeSelector } from "@/components/Masses/ModeSelector"
import RecipeCheatsheet from "@/components/Masses/RecipeCheatsheet"
import { TotalsCard } from "@/components/Masses/TotalsCard"

import { useMassCalcState } from "@/hooks/useMassCalcState"
import { useMassResults } from "@/hooks/useMassResults"
import { useMassSave } from "@/hooks/useMassSave"

export const Route = createFileRoute("/_layout/masses/$massUid")({
  component: MassCalculatorPage,
  head: () => ({
    meta: [{ title: "Mass Calculator - Startopia Calc" }],
  }),
})

function MassCalculatorPage() {
  const { massUid } = useParams({ from: "/_layout/masses/$massUid" })
  const navigate = useNavigate()

  useEffect(() => {
    if (massUid === "new") {
      navigate({ to: "/masses", replace: true })
    }
  }, [massUid, navigate])

  const { data: loadedMass, isLoading: isLoadingMass } = useQuery({
    queryKey: ["mass", massUid],
    queryFn: () => MassesService.readMass({ massUid }),
    enabled: massUid !== "new",
  })

  const {
    state,
    update,
    updateItem,
    addItemFromIngredient,
    removeItemBySourcePath,
    removeItem,
    handleItemSelect,
    handleItemClear,
    handleTreesChange,
    setItemTreeCount,
  } = useMassCalcState(loadedMass)

  const { resultsCache, totals } = useMassResults(state.items, state.mode, state.hitCost)

  const { saveMutation } = useMassSave(state, (uid) => {
    window.location.href = `/masses/${uid}`
  })

  const hasItems = state.items.some((i) => i.itemUid && i.treeCount > 0)
  const isValid = hasItems

  const [targetInput, setTargetInput] = useState(state.targetSeeds > 0 ? String(state.targetSeeds) : "")
  const debouncedTargetSeeds = useDebouncedCallback(
    (v: number) => update({ targetSeeds: v }),
    400,
  )
  useEffect(() => {
    setTargetInput(state.targetSeeds > 0 ? String(state.targetSeeds) : "")
  }, [state.items[0]?.itemUid])

  if (massUid === "new") return null

  if (isLoadingMass) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <MassCalcHeader
        name={state.name}
        description={state.description}
        mode={state.mode}
        isValid={isValid}
        isPending={saveMutation.isPending}
        uid={state.uid}
        onSave={() => saveMutation.mutate()}
      />

      <Card>
        <CardContent className="px-4 py-3">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Mode</Label>
              <ModeSelector value={state.mode} onChange={(v) => update({ mode: v })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Hit Cost (gems/smash)</Label>
              <Input
                type="number"
                min={1}
                value={state.hitCost || ""}
                onChange={(e) => update({ hitCost: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                placeholder="1"
                className="h-7 w-20 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Target seeds</Label>
              <Input
                type="number"
                min={0}
                value={targetInput}
                onChange={(e) => {
                  setTargetInput(e.target.value)
                  debouncedTargetSeeds(Math.max(0, parseInt(e.target.value, 10) || 0))
                }}
                placeholder="0"
                className="h-7 w-24 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <TotalsCard totals={totals} />

      {state.items[0]?.itemUid && (
        <RecipeCheatsheet
          itemUid={state.items[0].itemUid}
          items={state.items}
          mode={state.mode}
          targetSeeds={state.targetSeeds}
          onAddItem={addItemFromIngredient}
          onRemoveItem={removeItemBySourcePath}
          onApplyTrees={setItemTreeCount}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {state.items.map((item, i) => (
          <MassItemCard
            key={item.tempId}
            item={item}
            result={resultsCache.get(item.tempId)}
            onItemSelect={handleItemSelect}
            onItemClear={handleItemClear}
            onTreesChange={handleTreesChange}
            onPriceBuyChange={(tid, v) => updateItem(tid, { priceBuy: v })}
            onPriceSellChange={(tid, v) => updateItem(tid, { priceSell: v })}
            onFuelChange={(tid, v) => updateItem(tid, { isFuel: v })}
            onAutoBreakChange={(tid, v) => updateItem(tid, { isAutoBreak: v })}
            onRemove={i === 0 ? undefined : removeItem}
          />
        ))}
      </div>
    </div>
  )
}
