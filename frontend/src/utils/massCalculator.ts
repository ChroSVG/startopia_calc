const KOEFISIEN_YIELD: Record<number, number> = { 1: 1, 2: 3, 3: 6, 4: 10 }
const RATIO_DROP_BLOCK = 1 / 12
const GEM_BLOCK_RATIO = 2 / 3
const BLOCK_SEED_DIVISOR = 4

export function blocksProduced(treeCount: number, maxBlocks: number): number {
  if (!(maxBlocks in KOEFISIEN_YIELD)) {
    throw new Error("max_blocks must be 1, 2, 3, or 4")
  }
  const koef = KOEFISIEN_YIELD[maxBlocks]
  return Math.floor(treeCount * (koef / maxBlocks) * 2.5)
}

function blocksToBreak(blocks: number): number {
  return Math.floor(blocks / (1 - RATIO_DROP_BLOCK))
}

function seedsFromTreeA(treeCount: number, treeRarity: number): number {
  return Math.floor(treeCount * (4 / (treeRarity + 12)))
}

function seedsFromTreeB(treeCount: number, treeRarity: number): number {
  return Math.floor(treeCount * (8 / 3 / (treeRarity + 6)))
}

function seedsFromBreak(brokenBlocks: number): number {
  return Math.floor(brokenBlocks / BLOCK_SEED_DIVISOR)
}

function avgGemsPerBlock(blockRarity: number): number {
  const pembagi = blockRarity < 31 ? 13.5 : 9
  return blockRarity / pembagi
}

function gemProducingBlocks(totalBrokenBlocks: number): number {
  return Math.floor(totalBrokenBlocks * GEM_BLOCK_RATIO)
}

function growTimeSeconds(treeRarity: number): number {
  return treeRarity * (treeRarity * treeRarity + 30)
}

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0 Detik"
  const DETIK_PER_TAHUN = 31557600
  const DETIK_PER_BULAN = 2629800
  const DETIK_PER_HARI = 86400
  const DETIK_PER_JAM = 3600
  const DETIK_PER_MENIT = 60

  let remaining = totalSeconds
  const years = Math.floor(remaining / DETIK_PER_TAHUN)
  remaining -= years * DETIK_PER_TAHUN
  const months = Math.floor(remaining / DETIK_PER_BULAN)
  remaining -= months * DETIK_PER_BULAN
  const days = Math.floor(remaining / DETIK_PER_HARI)
  remaining -= days * DETIK_PER_HARI
  const hours = Math.floor(remaining / DETIK_PER_JAM)
  remaining -= hours * DETIK_PER_JAM
  const minutes = Math.floor(remaining / DETIK_PER_MENIT)
  remaining -= minutes * DETIK_PER_MENIT
  const seconds = remaining

  const parts: string[] = []
  if (years) parts.push(`${years} Tahun`)
  if (months) parts.push(`${months} Bulan`)
  if (days) parts.push(`${days} Hari`)
  if (hours) parts.push(`${hours} Jam`)
  if (minutes) parts.push(`${minutes} Menit`)
  if (seconds) parts.push(`${seconds} Detik`)
  return parts.join(" ")
}

export interface MassItemResult {
  blocks_produced: number
  total_blocks_broken: number
  seeds_from_tree: number
  seeds_from_break: number
  total_seeds_return: number
  seed_return_rate: number
  gem_producing_blocks: number
  avg_gems_per_block: number
  gems_from_tree: number
  total_gems: number
  auto_break_cost: number
  grow_time_seconds: number
  grow_time_readable: string
}

export function calculateTreeYield(
  treeRarity: number,
  maxBlocks: number,
  treeCount: number,
  mode: string,
  isFuel: boolean = false,
  isAutoBreak: boolean = false,
  hitCost: number = 1,
  hitsPerBlock: number = 3,
): MassItemResult {
  const growTime = growTimeSeconds(treeRarity)

  if (treeCount <= 0) {
    return {
      blocks_produced: 0,
      total_blocks_broken: 0,
      seeds_from_tree: 0,
      seeds_from_break: 0,
      total_seeds_return: 0,
      seed_return_rate: 0,
      gem_producing_blocks: 0,
      avg_gems_per_block: roundTo(avgGemsPerBlock(treeRarity), 4),
      gems_from_tree: 0,
      total_gems: 0,
      auto_break_cost: 0,
      grow_time_seconds: growTime,
      grow_time_readable: formatDuration(growTime),
    }
  }

  let blocks: number
  let baseBlocksForSeeds: number

  if (isFuel) {
    const virtualTrees = Math.floor(treeCount * 0.1)
    const baseB = blocksProduced(treeCount, maxBlocks)
    const virtB = blocksProduced(virtualTrees, maxBlocks)
    blocks = baseB + virtB
    baseBlocksForSeeds = baseB
  } else {
    blocks = blocksProduced(treeCount, maxBlocks)
    baseBlocksForSeeds = blocks
  }

  const totalBroken = blocksToBreak(blocks)
  const baseBrokenForSeeds = blocksToBreak(baseBlocksForSeeds)

  const seedsFallenVal =
    mode === "b" || mode === "bpresisi"
      ? seedsFromTreeB(treeCount, treeRarity)
      : seedsFromTreeA(treeCount, treeRarity)

  const seedsFromBreakVal = seedsFromBreak(baseBrokenForSeeds)
  const totalSeedsReturnVal = seedsFallenVal + seedsFromBreakVal
  const seedReturnRateVal = treeCount
    ? (totalSeedsReturnVal / treeCount) * 100
    : 0

  const gemBlocksVal = gemProducingBlocks(baseBrokenForSeeds)
  const avgGemsVal = avgGemsPerBlock(treeRarity)

  let harvestGemsVal: number
  let totalGemsVal: number

  if (mode === "apresisi" || mode === "bpresisi") {
    const rawYield = treeCount * (KOEFISIEN_YIELD[maxBlocks] / maxBlocks) * 2.5
    const rawSmash = rawYield / (1 - RATIO_DROP_BLOCK)
    harvestGemsVal = Math.floor(treeCount * avgGemsVal)
    totalGemsVal = Math.floor((rawSmash * (2 / 3) + treeCount) * avgGemsVal)
  } else {
    harvestGemsVal = Math.floor(treeCount * avgGemsVal)
    totalGemsVal = Math.floor(gemBlocksVal * avgGemsVal + harvestGemsVal)
  }

  const autoBreakCost = isAutoBreak ? totalBroken * hitsPerBlock * hitCost : 0

  return {
    blocks_produced: blocks,
    total_blocks_broken: totalBroken,
    seeds_from_tree: seedsFallenVal,
    seeds_from_break: seedsFromBreakVal,
    total_seeds_return: totalSeedsReturnVal,
    seed_return_rate: roundTo(seedReturnRateVal, 2),
    gem_producing_blocks: gemBlocksVal,
    avg_gems_per_block: roundTo(avgGemsVal, 4),
    gems_from_tree: harvestGemsVal,
    total_gems: totalGemsVal,
    auto_break_cost: autoBreakCost,
    grow_time_seconds: growTime,
    grow_time_readable: formatDuration(growTime),
  }
}

export function findMinTreesForTarget(
  treeRarity: number,
  maxBlocks: number,
  targetSeeds: number,
  mode: string,
): { treeCount: number; seeds: number; result: MassItemResult } {
  if (targetSeeds <= 0) {
    const r = calculateTreeYield(treeRarity, maxBlocks, 0, mode)
    return { treeCount: 0, seeds: 0, result: r }
  }

  let high = 1
  while (
    calculateTreeYield(treeRarity, maxBlocks, high, mode).total_seeds_return <
    targetSeeds
  ) {
    high *= 2
  }

  let low = 1
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const r = calculateTreeYield(treeRarity, maxBlocks, mid, mode)
    if (r.total_seeds_return >= targetSeeds) {
      high = mid
    } else {
      low = mid + 1
    }
  }

  const r = calculateTreeYield(treeRarity, maxBlocks, low, mode)
  return { treeCount: low, seeds: r.total_seeds_return, result: r }
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
