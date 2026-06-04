import { useMemo } from "react"
import type { MassItemResult } from "@/utils/massCalculator"
import { calculateItem, formatDuration } from "@/utils/massCalculator"
import type { CalculatorItem } from "@/utils/massTypes"

export interface Totals {
  totalTrees: number
  totalBlocks: number
  totalSmash: number
  totalSeeds: number
  totalGems: number
  maxGrowSecs: number
  growReadable: string
}

export function useMassResults(items: CalculatorItem[], mode: string) {
  const resultsCache = useMemo(() => {
    const map = new Map<string, MassItemResult>()
    for (const item of items) {
      map.set(
        item.tempId,
        calculateItem(item.treeRarity, item.maxBlocks, item.jumlahPohon, mode),
      )
    }
    return map
  }, [items, mode])

  const totals = useMemo(() => {
    let totalTrees = 0
    let totalBlocks = 0
    let totalSmash = 0
    let totalSeeds = 0
    let totalGems = 0
    let maxGrowSecs = 0

    for (const item of items) {
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
  }, [items, resultsCache])

  return { resultsCache, totals }
}
