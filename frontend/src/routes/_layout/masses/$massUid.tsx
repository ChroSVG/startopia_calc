import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { Loader2, Plus } from "lucide-react"

import { MassesService } from "@/client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MassCalcHeader } from "@/components/Masses/MassCalcHeader"
import { ModeSelector } from "@/components/Masses/ModeSelector"
import { TotalsCard } from "@/components/Masses/TotalsCard"
import { MassItemCard } from "@/components/Masses/MassItemCard"
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

  if (massUid === "new") {
    navigate({ to: "/masses", replace: true })
    return null
  }

  const { data: loadedMass, isLoading: isLoadingMass } = useQuery({
    queryKey: ["mass", massUid],
    queryFn: () => MassesService.readMass({ massUid }),
  })

  const {
    state,
    update,
    addItem,
    removeItem,
    resetCalc,
    handleItemSelect,
    handleItemClear,
    handleTreesChange,
  } = useMassCalcState(loadedMass)

  const { resultsCache, totals } = useMassResults(state.items, state.mode)

  const { saveMutation } = useMassSave(state, (uid) => {
    window.location.href = `/masses/${uid}`
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
      <MassCalcHeader
        name={state.name}
        description={state.description}
        mode={state.mode}
        hasItems={hasItems}
        isDirty={isDirty}
        isValid={isValid}
        isPending={saveMutation.isPending}
        uid={state.uid}
        onSave={() => saveMutation.mutate()}
        onReset={resetCalc}
      />

      <ModeSelector value={state.mode} onChange={(v) => update({ mode: v })} />

      {hasItems && <TotalsCard totals={totals} />}

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
        {state.items.map((item) => (
          <MassItemCard
            key={item.tempId}
            item={item}
            result={resultsCache.get(item.tempId)}
            onItemSelect={handleItemSelect}
            onItemClear={handleItemClear}
            onTreesChange={handleTreesChange}
            onRemove={removeItem}
          />
        ))}
      </div>
    </div>
  )
}
