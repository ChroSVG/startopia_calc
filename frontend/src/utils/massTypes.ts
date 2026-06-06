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
  priceBuy: string
  priceSell: string
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
  gemsPerWl: number
  fuelPrice: string
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
    priceBuy: "",
    priceSell: "",
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
    gemsPerWl: mass.gems_per_wl ?? 100,
    fuelPrice: mass.fuel_price ? String(mass.fuel_price) : "",
    items: (mass.items ?? []).map((i) => ({
      tempId: nextTempId(),
      itemUid: i.item_uid ?? null,
      itemName: i.item_name ?? "",
      rarity: i.rarity ?? "",
      treeRarity: i.tree_rarity ?? 1,
      maxBlocks: i.max_blocks ?? 1,
      treeCount: i.jumlah_pohon ?? 0,
      priceBuy: i.price_buy ? String(i.price_buy) : "",
      priceSell: i.price_sell ? String(i.price_sell) : "",
      isFuel: i.is_fuel ?? false,
      isAutoBreak: i.is_auto_break ?? false,
      sourcePath: i.source_path ?? undefined,
    })),
  }
}

export function parsePrice(input: string): number {
  if (!input) return 0
  const match = input.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (match) {
    const seeds = parseInt(match[1], 10)
    const wl = parseInt(match[2], 10)
    if (seeds > 0) return wl / seeds
    return 0
  }
  const num = parseFloat(input)
  return Number.isNaN(num) ? 0 : num
}

export function calcStateToPayload(state: CalcState) {
  return {
    name: state.name,
    description: state.description || null,
    mode: state.mode,
    target_seeds: state.targetSeeds ?? undefined,
    hit_cost: state.hitCost ?? undefined,
    gems_per_wl: state.gemsPerWl ?? undefined,
    fuel_price: parsePrice(state.fuelPrice) || undefined,
    items: state.items.map((i) => ({
      item_uid: i.itemUid || undefined,
      item_name: i.itemName || "Item",
      rarity: i.rarity || undefined,
      tree_rarity: i.treeRarity,
      max_blocks: i.maxBlocks,
      jumlah_pohon: i.treeCount,
      price_buy: parsePrice(i.priceBuy) || undefined,
      price_sell: parsePrice(i.priceSell) || undefined,
      is_fuel: i.isFuel,
      is_auto_break: i.isAutoBreak,
      source_path: i.sourcePath || undefined,
    })),
  }
}
