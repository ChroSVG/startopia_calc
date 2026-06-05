import type { MassModel } from "@/client"

export const MODES = [
  { value: "a", label: "Mode A" },
  { value: "b", label: "Mode B" },
  { value: "apresisi", label: "Mode A Presisi" },
  { value: "bpresisi", label: "Mode B Presisi" },
] as const

export interface CalculatorItem {
  tempId: string
  itemUid: string | null
  itemName: string
  rarity: string
  treeRarity: number
  maxBlocks: number
  treeCount: number
  priceBuy: number
  priceSell: number
  isFuel: boolean
  isAutoBreak: boolean
  sourcePath?: string
}

export interface CalcState {
  uid: string | null
  name: string
  description: string
  mode: string
  targetSeeds: number
  hitCost: number
  items: CalculatorItem[]
}

let tempIdCounter = 0

export function nextTempId() {
  tempIdCounter++
  return `temp_${tempIdCounter}`
}

export function resetTempIdCounter() {
  tempIdCounter = 0
}

export function blankItem(): CalculatorItem {
  return {
    tempId: nextTempId(),
    itemUid: null,
    itemName: "",
    rarity: "",
    treeRarity: 1,
    maxBlocks: 1,
    treeCount: 0,
    priceBuy: 0,
    priceSell: 0,
    isFuel: false,
    isAutoBreak: false,
  }
}

export function massToCalcState(mass: MassModel): CalcState {
  return {
    uid: mass.uid,
    name: mass.name,
    description: mass.description ?? "",
    mode: mass.mode,
    targetSeeds: mass.target_seeds ?? 0,
    hitCost: mass.hit_cost ?? 1,
    items: (mass.items ?? []).map((i) => ({
      tempId: nextTempId(),
      itemUid: i.item_uid ?? null,
      itemName: i.item_name ?? "",
      rarity: i.rarity ?? "",
      treeRarity: i.tree_rarity ?? 1,
      maxBlocks: i.max_blocks ?? 1,
      treeCount: i.jumlah_pohon ?? 0,
      priceBuy: i.price_buy ?? 0,
      priceSell: i.price_sell ?? 0,
      isFuel: i.is_fuel ?? false,
      isAutoBreak: i.is_auto_break ?? false,
      sourcePath: i.source_path ?? undefined,
    })),
  }
}

export function calcStateToPayload(state: CalcState) {
  return {
    name: state.name,
    description: state.description || null,
    mode: state.mode,
    target_seeds: state.targetSeeds ?? undefined,
    hit_cost: state.hitCost ?? undefined,
    items: state.items.map((i) => ({
      item_uid: i.itemUid || undefined,
      item_name: i.itemName || "Item",
      rarity: i.rarity || undefined,
      tree_rarity: i.treeRarity,
      max_blocks: i.maxBlocks,
      jumlah_pohon: i.treeCount,
      price_buy: i.priceBuy || undefined,
      price_sell: i.priceSell || undefined,
      is_fuel: i.isFuel,
      is_auto_break: i.isAutoBreak,
      source_path: i.sourcePath || undefined,
    })),
  }
}
