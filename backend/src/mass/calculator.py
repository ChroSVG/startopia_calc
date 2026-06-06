KOEFISIEN_YIELD = {1: 1, 2: 3, 3: 6, 4: 10}
RATIO_DROP_BLOCK = 1 / 12
GEM_BLOCK_RATIO = 2 / 3
BLOCK_SEED_DIVISOR = 4


def blocks_produced(tree_count: int, max_blocks: int) -> int:
    if max_blocks not in KOEFISIEN_YIELD:
        raise ValueError("max_blocks must be 1, 2, 3, or 4")
    koef = KOEFISIEN_YIELD[max_blocks]
    return int(tree_count * (koef / max_blocks) * 2.5)


def blocks_to_break(total_blocks: int) -> int:
    return int(total_blocks / (1 - RATIO_DROP_BLOCK))


def seeds_from_tree_a(tree_count: int, tree_rarity: int) -> int:
    return int(tree_count * (4 / (tree_rarity + 12)))


def seeds_from_tree_b(tree_count: int, tree_rarity: int) -> int:
    return int(tree_count * (8 / 3 / (tree_rarity + 6)))


def seeds_from_break(broken_blocks: int) -> int:
    return int(broken_blocks / BLOCK_SEED_DIVISOR)


def avg_gems_per_block(block_rarity: int) -> float:
    pembagi = 13.5 if block_rarity < 31 else 9
    return block_rarity / pembagi


def gem_producing_blocks(total_broken_blocks: int) -> int:
    return int(total_broken_blocks * GEM_BLOCK_RATIO)


def grow_time_seconds(tree_rarity: int) -> int:
    return tree_rarity * (tree_rarity ** 2 + 30)


def format_duration(total_seconds: int) -> str:
    if total_seconds <= 0:
        return "0s"
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
        parts.append(f"{years} y")
    if months:
        parts.append(f"{months} mo")
    if days:
        parts.append(f"{days} d")
    if hours:
        parts.append(f"{hours} h")
    if minutes:
        parts.append(f"{minutes} m")
    if seconds:
        parts.append(f"{seconds} s")
    return " ".join(parts)


def calculate_item(tree_rarity: int, max_blocks: int, tree_count: int, mode: str, is_fuel: bool = False, is_auto_break: bool = False, hit_cost: int = 1, hits_per_block: int = 3) -> dict:
    if tree_count <= 0:
        grow_time = grow_time_seconds(tree_rarity)
        return {
            "blocks_produced": 0,
            "total_blocks_broken": 0,
            "seeds_from_tree": 0,
            "seeds_from_break": 0,
            "total_seeds_return": 0,
            "seed_return_rate": 0.0,
            "gem_producing_blocks": 0,
            "avg_gems_per_block": avg_gems_per_block(tree_rarity),
            "gems_from_tree": 0,
            "total_gems": 0,
            "auto_break_cost": 0,
            "grow_time_seconds": grow_time,
            "grow_time_readable": format_duration(grow_time),
        }

    if is_fuel:
        virtual_trees = int(tree_count * 0.1)
        base_blocks = blocks_produced(tree_count, max_blocks)
        virt_blocks = blocks_produced(virtual_trees, max_blocks)
        blocks = base_blocks + virt_blocks
    else:
        blocks = blocks_produced(tree_count, max_blocks)

    total_broken = blocks_to_break(blocks)
    base_broken_for_seeds = blocks_to_break(base_blocks) if is_fuel else total_broken

    if mode in ("b", "bpresisi"):
        seeds_from_tree_val = seeds_from_tree_b(tree_count, tree_rarity)
    else:
        seeds_from_tree_val = seeds_from_tree_a(tree_count, tree_rarity)

    seeds_from_break_val = seeds_from_break(base_broken_for_seeds)
    total_seeds_return_val = seeds_from_tree_val + seeds_from_break_val
    seed_return_rate_val = (total_seeds_return_val / tree_count) * 100 if tree_count else 0.0

    gem_producing_blocks_val = gem_producing_blocks(base_broken_for_seeds)
    avg_gems_val = avg_gems_per_block(tree_rarity)

    if mode in ("apresisi", "bpresisi"):
        raw_yield = tree_count * (KOEFISIEN_YIELD[max_blocks] / max_blocks) * 2.5
        raw_smash = raw_yield / (1 - RATIO_DROP_BLOCK)
        gems_from_tree_val = int(tree_count * avg_gems_val)
        total_gems_val = int((raw_smash * 2 / 3 + tree_count) * avg_gems_val)
    else:
        gems_from_tree_val = int(tree_count * avg_gems_val)
        total_gems_val = int((gem_producing_blocks_val * avg_gems_val) + gems_from_tree_val)

    grow_time = grow_time_seconds(tree_rarity)

    auto_break_cost = total_broken * hits_per_block * hit_cost if is_auto_break else 0

    return {
        "blocks_produced": blocks,
        "total_blocks_broken": total_broken,
        "seeds_from_tree": seeds_from_tree_val,
        "seeds_from_break": seeds_from_break_val,
        "total_seeds_return": total_seeds_return_val,
        "seed_return_rate": round(seed_return_rate_val, 2),
        "gem_producing_blocks": gem_producing_blocks_val,
        "avg_gems_per_block": round(avg_gems_val, 4),
        "gems_from_tree": gems_from_tree_val,
        "total_gems": total_gems_val,
        "auto_break_cost": auto_break_cost,
        "grow_time_seconds": grow_time,
        "grow_time_readable": format_duration(grow_time),
    }
