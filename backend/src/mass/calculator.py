KOEFISIEN_YIELD = {1: 1, 2: 3, 3: 6, 4: 10}
RATIO_DROP_BLOCK = 1 / 12
GEM_BLOCK_RATIO = 2 / 3
BLOCK_SEED_DIVISOR = 4


def blocks_yielded(jumlah_pohon: int, max_blocks: int) -> int:
    if max_blocks not in KOEFISIEN_YIELD:
        raise ValueError("max_blocks must be 1, 2, 3, or 4")
    koef = KOEFISIEN_YIELD[max_blocks]
    return int(jumlah_pohon * (koef / max_blocks) * 2.5)


def total_smashed_blocks(blok_yielded: int) -> int:
    return int(blok_yielded / (1 - RATIO_DROP_BLOCK))


def seeds_fallen_a(jumlah_pohon: int, tree_rarity: int) -> int:
    return int(jumlah_pohon * (4 / (tree_rarity + 12)))


def seeds_fallen_b(jumlah_pohon: int, tree_rarity: int) -> int:
    return int(jumlah_pohon * (8 / 3 / (tree_rarity + 6)))


def seeds_from_smash(smashed_blocks: int) -> int:
    return int(smashed_blocks / BLOCK_SEED_DIVISOR)


def avg_gems_per_block(block_rarity: int) -> float:
    pembagi = 13.5 if block_rarity < 31 else 9
    return block_rarity / pembagi


def gem_giving_blocks(total_smashed_blocks: int) -> int:
    return int(total_smashed_blocks * GEM_BLOCK_RATIO)


def grow_time_seconds(tree_rarity: int) -> int:
    return tree_rarity * (tree_rarity ** 2 + 30)


def format_duration(total_seconds: int) -> str:
    if total_seconds <= 0:
        return "0 Detik"
    DETIK_PER_TAHUN = 31557600
    DETIK_PER_BULAN = 2629800
    DETIK_PER_HARI = 86400
    DETIK_PER_JAM = 3600
    DETIK_PER_MENIT = 60

    years, total_seconds = divmod(total_seconds, DETIK_PER_TAHUN)
    months, total_seconds = divmod(total_seconds, DETIK_PER_BULAN)
    days, total_seconds = divmod(total_seconds, DETIK_PER_HARI)
    hours, total_seconds = divmod(total_seconds, DETIK_PER_JAM)
    minutes, total_seconds = divmod(total_seconds, DETIK_PER_MENIT)
    seconds = total_seconds

    parts = []
    if years:
        parts.append(f"{years} Tahun")
    if months:
        parts.append(f"{months} Bulan")
    if days:
        parts.append(f"{days} Hari")
    if hours:
        parts.append(f"{hours} Jam")
    if minutes:
        parts.append(f"{minutes} Menit")
    if seconds:
        parts.append(f"{seconds} Detik")
    return " ".join(parts)


def calculate_item(tree_rarity: int, max_blocks: int, jumlah_pohon: int, mode: str, is_fuel: bool = False, is_auto_break: bool = False, hit_cost: int = 1) -> dict:
    if jumlah_pohon <= 0:
        return {
            "blok_yielded": 0,
            "total_smash_efektif": 0,
            "seeds_fallen": 0,
            "seeds_from_smash": 0,
            "total_seeds_return": 0,
            "seed_return_rate": 0.0,
            "gem_blocks": 0,
            "avg_gems_per_block": avg_gems_per_block(tree_rarity),
            "harvest_gems": 0,
            "total_gems_didapat": 0,
            "grow_time_seconds": grow_time_seconds(tree_rarity),
            "grow_time_readable": format_duration(grow_time_seconds(tree_rarity)),
        }

    blok_yielded = int(blocks_yielded(jumlah_pohon, max_blocks) * 1.1) if is_fuel else blocks_yielded(jumlah_pohon, max_blocks)
    total_smash = total_smashed_blocks(blok_yielded)

    if mode in ("b", "bpresisi"):
        seeds_fallen_val = seeds_fallen_b(jumlah_pohon, tree_rarity)
    else:
        seeds_fallen_val = seeds_fallen_a(jumlah_pohon, tree_rarity)

    seeds_from_smash_val = seeds_from_smash(total_smash)
    total_seeds_return_val = seeds_fallen_val + seeds_from_smash_val
    seed_return_rate_val = (total_seeds_return_val / jumlah_pohon) * 100 if jumlah_pohon else 0.0

    gem_blocks_val = gem_giving_blocks(total_smash)
    avg_gems_val = avg_gems_per_block(tree_rarity)

    if mode in ("apresisi", "bpresisi"):
        raw_yield = jumlah_pohon * (KOEFISIEN_YIELD[max_blocks] / max_blocks) * 2.5
        raw_smash = raw_yield / (1 - RATIO_DROP_BLOCK)
        harvest_gems_val = int(jumlah_pohon * avg_gems_val)
        total_gems_val = int((raw_smash * 2 / 3 + jumlah_pohon) * avg_gems_val)
    else:
        harvest_gems_val = int(jumlah_pohon * avg_gems_val)
        total_gems_val = int((gem_blocks_val * avg_gems_val) + harvest_gems_val)

    grow_time = grow_time_seconds(tree_rarity)

    if is_auto_break:
        total_gems_val = max(0, total_gems_val - total_smash * hit_cost)

    return {
        "blok_yielded": blok_yielded,
        "total_smash_efektif": total_smash,
        "seeds_fallen": seeds_fallen_val,
        "seeds_from_smash": seeds_from_smash_val,
        "total_seeds_return": total_seeds_return_val,
        "seed_return_rate": round(seed_return_rate_val, 2),
        "gem_blocks": gem_blocks_val,
        "avg_gems_per_block": round(avg_gems_val, 4),
        "harvest_gems": harvest_gems_val,
        "total_gems_didapat": total_gems_val,
        "grow_time_seconds": grow_time,
        "grow_time_readable": format_duration(grow_time),
    }
