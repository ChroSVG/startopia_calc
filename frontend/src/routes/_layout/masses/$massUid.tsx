import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

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
    addItemFromIngredient,
    removeItemBySourcePath,
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
        isDirty={isDirty}
        isValid={isValid}
        isPending={saveMutation.isPending}
        uid={state.uid}
        onSave={() => saveMutation.mutate()}
        onReset={resetCalc}
      />

      <ModeSelector value={state.mode} onChange={(v) => update({ mode: v })} />

      {hasItems && <TotalsCard totals={totals} />}

      {state.items[0]?.itemUid && (
        <RecipeCheatsheet
          itemUid={state.items[0].itemUid}
          items={state.items}
          onAddItem={addItemFromIngredient}
          onRemoveItem={removeItemBySourcePath}
        />
      )}

      <div className="space-y-3">
        {state.items.map((item, i) => (
          <MassItemCard
            key={item.tempId}
            item={item}
            result={resultsCache.get(item.tempId)}
            onItemSelect={handleItemSelect}
            onItemClear={handleItemClear}
            onTreesChange={handleTreesChange}
            onRemove={i === 0 ? undefined : removeItem}
          />
        ))}
      </div>
    </div>
  )
}
