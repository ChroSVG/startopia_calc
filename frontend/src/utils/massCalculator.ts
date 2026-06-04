const KOEFISIEN_YIELD: Record<number, number> = { 1: 1, 2: 3, 3: 6, 4: 10 }
const RATIO_DROP_BLOCK = 1 / 12
const GEM_BLOCK_RATIO = 2 / 3
const BLOCK_SEED_DIVISOR = 4

function blocksYielded(jumlahPohon: number, maxBlocks: number): number {
  if (!(maxBlocks in KOEFISIEN_YIELD)) {
    throw new Error("max_blocks must be 1, 2, 3, or 4")
  }
  const koef = KOEFISIEN_YIELD[maxBlocks]
  return Math.floor(jumlahPohon * (koef / maxBlocks) * 2.5)
}

function totalSmashedBlocks(blokYielded: number): number {
  return Math.floor(blokYielded / (1 - RATIO_DROP_BLOCK))
}

function seedsFallenA(jumlahPohon: number, treeRarity: number): number {
  return Math.floor(jumlahPohon * (4 / (treeRarity + 12)))
}

function seedsFallenB(jumlahPohon: number, treeRarity: number): number {
  return Math.floor(jumlahPohon * (8 / 3 / (treeRarity + 6)))
}

function seedsFromSmash(smashedBlocks: number): number {
  return Math.floor(smashedBlocks / BLOCK_SEED_DIVISOR)
}

function avgGemsPerBlock(blockRarity: number): number {
  const pembagi = blockRarity < 31 ? 13.5 : 9
  return blockRarity / pembagi
}

function gemGivingBlocks(totalSmashedBlocks: number): number {
  return Math.floor(totalSmashedBlocks * GEM_BLOCK_RATIO)
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
  blok_yielded: number
  total_smash_efektif: number
  seeds_fallen: number
  seeds_from_smash: number
  total_seeds_return: number
  seed_return_rate: number
  gem_blocks: number
  avg_gems_per_block: number
  harvest_gems: number
  total_gems_didapat: number
  grow_time_seconds: number
  grow_time_readable: string
}

export function calculateItem(
  treeRarity: number,
  maxBlocks: number,
  jumlahPohon: number,
  mode: string,
): MassItemResult {
  const growTime = growTimeSeconds(treeRarity)

  if (jumlahPohon <= 0) {
    return {
      blok_yielded: 0,
      total_smash_efektif: 0,
      seeds_fallen: 0,
      seeds_from_smash: 0,
      total_seeds_return: 0,
      seed_return_rate: 0,
      gem_blocks: 0,
      avg_gems_per_block: roundTo(avgGemsPerBlock(treeRarity), 4),
      harvest_gems: 0,
      total_gems_didapat: 0,
      grow_time_seconds: growTime,
      grow_time_readable: formatDuration(growTime),
    }
  }

  const blokYielded = blocksYielded(jumlahPohon, maxBlocks)
  const totalSmash = totalSmashedBlocks(blokYielded)

  const seedsFallenVal =
    mode === "b" || mode === "bpresisi"
      ? seedsFallenB(jumlahPohon, treeRarity)
      : seedsFallenA(jumlahPohon, treeRarity)

  const seedsFromSmashVal = seedsFromSmash(totalSmash)
  const totalSeedsReturnVal = seedsFallenVal + seedsFromSmashVal
  const seedReturnRateVal =
    jumlahPohon ? (totalSeedsReturnVal / jumlahPohon) * 100 : 0

  const gemBlocksVal = gemGivingBlocks(totalSmash)
  const avgGemsVal = avgGemsPerBlock(treeRarity)

  let harvestGemsVal: number
  let totalGemsVal: number

  if (mode === "apresisi" || mode === "bpresisi") {
    const rawYield =
      jumlahPohon * (KOEFISIEN_YIELD[maxBlocks] / maxBlocks) * 2.5
    const rawSmash = rawYield / (1 - RATIO_DROP_BLOCK)
    harvestGemsVal = Math.floor(jumlahPohon * avgGemsVal)
    totalGemsVal = Math.floor((rawSmash * (2 / 3) + jumlahPohon) * avgGemsVal)
  } else {
    harvestGemsVal = Math.floor(jumlahPohon * avgGemsVal)
    totalGemsVal = Math.floor(gemBlocksVal * avgGemsVal + harvestGemsVal)
  }

  return {
    blok_yielded: blokYielded,
    total_smash_efektif: totalSmash,
    seeds_fallen: seedsFallenVal,
    seeds_from_smash: seedsFromSmashVal,
    total_seeds_return: totalSeedsReturnVal,
    seed_return_rate: roundTo(seedReturnRateVal, 2),
    gem_blocks: gemBlocksVal,
    avg_gems_per_block: roundTo(avgGemsVal, 4),
    harvest_gems: harvestGemsVal,
    total_gems_didapat: totalGemsVal,
    grow_time_seconds: growTime,
    grow_time_readable: formatDuration(growTime),
  }
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
