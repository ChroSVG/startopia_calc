import { useMemo } from "react"
import type { MassItemResult } from "@/utils/massCalculator"
import { calculateTreeYield, formatDuration } from "@/utils/massCalculator"
import type { CalculatorItem } from "@/utils/massTypes"
import { parsePrice } from "@/utils/massTypes"

export interface Totals {
  totalTrees: number
  totalBlocks: number
  totalBlocksBroken: number
  totalSeeds: number
  totalGems: number
  totalGemsNet: number
  totalAutoBreakCost: number
  totalFuelUsed: number
  totalFuelCostWl: number
  totalModal: number
  totalProfit: number
  totalGemsWl: number
  totalGemsNetWl: number
  maxGrowSecs: number
  growReadable: string
}

export function useMassResults(
  items: CalculatorItem[],
  mode: string,
  hitCost: number = 1,
  gemsPerWl: number = 100,
  fuelPrice: string = "",
) {
  const resultsCache = useMemo(() => {
    const map = new Map<string, MassItemResult>()
    for (const item of items) {
      map.set(
        item.tempId,
        calculateTreeYield(
          item.treeRarity,
          item.maxBlocks,
          item.treeCount,
          mode,
          item.isFuel,
          item.isAutoBreak,
          hitCost,
          item.hitsPerBlock,
        ),
      )
    }
    return map
  }, [items, mode, hitCost])

  const totals = useMemo(() => {
    let totalTrees = 0
    let totalBlocks = 0
    let totalBlocksBroken = 0
    let totalSeeds = 0
    let totalGems = 0
    let totalAutoBreakCost = 0
    let totalModal = 0
    let totalProfit = 0
    let totalFuelUsed = 0
    let maxGrowSecs = 0

    for (const item of items) {
      const r = resultsCache.get(item.tempId)
      if (!r) continue
      if (item.isFuel) {
        totalFuelUsed += Math.floor(item.treeCount * 0.1)
      }
      totalTrees += item.treeCount
      totalBlocks += r.blocks_produced
      totalBlocksBroken += r.total_blocks_broken
      totalSeeds += r.total_seeds_return
      totalGems += r.total_gems
      totalAutoBreakCost += r.auto_break_cost
      const buy = parsePrice(item.priceBuy)
      const sell = parsePrice(item.priceSell)
      totalModal += buy * item.treeCount
      totalProfit += (sell - buy) * item.treeCount
      if (r.grow_time_seconds > maxGrowSecs) {
        maxGrowSecs = r.grow_time_seconds
      }
    }

    const gemsNet = totalGems - totalAutoBreakCost
    const gemsNetWl = gemsPerWl > 0 ? gemsNet / gemsPerWl : 0
    const fuelCostWl = parsePrice(fuelPrice) * totalFuelUsed
    totalProfit += gemsNetWl - fuelCostWl
    return {
      totalTrees,
      totalBlocks,
      totalBlocksBroken,
      totalSeeds,
      totalGems,
      totalGemsNet: gemsNet,
      totalAutoBreakCost,
      totalFuelUsed,
      totalFuelCostWl: fuelCostWl,
      totalModal,
      totalProfit,
      totalGemsWl: gemsPerWl > 0 ? totalGems / gemsPerWl : 0,
      totalGemsNetWl: gemsNetWl,
      maxGrowSecs,
      growReadable: formatDuration(maxGrowSecs),
    }
  }, [items, resultsCache, gemsPerWl, fuelPrice])

  return { resultsCache, totals }
}
