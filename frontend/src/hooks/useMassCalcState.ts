import { useCallback, useEffect, useState } from "react"
import type { ItemModel, MassModel } from "@/client"
import type { CalcState, CalculatorItem } from "@/utils/massTypes"
import { blankItem, massToCalcState, resetTempIdCounter } from "@/utils/massTypes"

export function useMassCalcState(loadedMass: MassModel | undefined) {
  const [state, setState] = useState<CalcState>(() => ({
    uid: null,
    name: "",
    description: "",
    mode: "a",
    items: [blankItem()],
  }))

  useEffect(() => {
    if (loadedMass) {
      resetTempIdCounter()
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
    resetTempIdCounter()
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

  const handleItemClear = useCallback(
    (tempId: string) =>
      updateItem(tempId, {
        itemUid: null,
        itemName: "",
        treeRarity: 1,
        maxBlocks: 1,
      }),
    [updateItem],
  )

  const handleTreesChange = useCallback(
    (tempId: string, trees: number) =>
      updateItem(tempId, { jumlahPohon: trees }),
    [updateItem],
  )

  return {
    state,
    update,
    addItem,
    removeItem,
    resetCalc,
    handleItemSelect,
    handleItemClear,
    handleTreesChange,
  }
}
