import pytest
from src.mass.calculator import (
    blocks_yielded,
    total_smashed_blocks,
    seeds_fallen_a,
    seeds_fallen_b,
    seeds_from_smash,
    avg_gems_per_block,
    gem_giving_blocks,
    grow_time_seconds,
    format_duration,
    calculate_item,
)


class TestBlocksYielded:
    def test_blocks_yielded_valid(self):
        assert blocks_yielded(1000, 1) == 2500
        assert blocks_yielded(1000, 2) == 3750
        assert blocks_yielded(1000, 3) == 5000
        assert blocks_yielded(1000, 4) == 6250

    def test_blocks_yielded_invalid_max_blocks(self):
        with pytest.raises(ValueError, match="max_blocks must be 1, 2, 3, or 4"):
            blocks_yielded(100, 5)

    def test_blocks_yielded_zero_trees(self):
        assert blocks_yielded(0, 1) == 0


class TestTotalSmashedBlocks:
    def test_total_smashed_blocks(self):
        assert total_smashed_blocks(2500) == 2727


class TestSeedsFallen:
    def test_seeds_fallen_a(self):
        assert seeds_fallen_a(1000, 86) == 40

    def test_seeds_fallen_b(self):
        assert seeds_fallen_b(1000, 86) == 28


class TestSeedsFromSmash:
    def test_seeds_from_smash(self):
        assert seeds_from_smash(2727) == 681


class TestAvgGemsPerBlock:
    def test_low_rarity(self):
        assert avg_gems_per_block(30) == pytest.approx(30 / 13.5)

    def test_high_rarity(self):
        assert avg_gems_per_block(86) == pytest.approx(86 / 9)


class TestGemGivingBlocks:
    def test_gem_giving_blocks(self):
        assert gem_giving_blocks(2727) == 1818


class TestGrowTimeSeconds:
    def test_grow_time_seconds(self):
        assert grow_time_seconds(86) == 86 * (86**2 + 30)


class TestFormatDuration:
    def test_zero_seconds(self):
        assert format_duration(0) == "0 Detik"

    def test_full_duration(self):
        result = format_duration(31557600 + 2629800 + 86400 + 3600 + 60 + 1)
        assert "1 Tahun" in result
        assert "1 Bulan" in result
        assert "1 Hari" in result
        assert "1 Jam" in result
        assert "1 Menit" in result
        assert "1 Detik" in result

    def test_only_seconds(self):
        assert format_duration(45) == "45 Detik"


class TestCalculateItem:
    def test_calculate_mode_a_standard(self):
        result = calculate_item(86, 2, 1000, "a")
        assert result["blok_yielded"] == 3750
        assert result["total_gems_didapat"] == 35603

    def test_calculate_mode_b(self):
        result = calculate_item(86, 2, 1000, "b")
        assert "seeds_fallen" in result
        assert "total_gems_didapat" in result

    def test_calculate_mode_apresisi(self):
        result = calculate_item(86, 2, 1000, "apresisi")
        assert "seeds_fallen" in result

    def test_calculate_mode_bpresisi(self):
        result = calculate_item(86, 2, 1000, "bpresisi")
        assert "seeds_fallen" in result

    def test_calculate_zero_trees(self):
        result = calculate_item(86, 2, 0, "a")
        assert result["blok_yielded"] == 0
        assert result["seeds_fallen"] == 0
        assert result["total_gems_didapat"] == 0

    def test_calculate_structure(self):
        result = calculate_item(50, 3, 500, "a")
        expected_keys = [
            "blok_yielded", "total_smash_efektif", "seeds_fallen",
            "seeds_from_smash", "total_seeds_return", "seed_return_rate",
            "gem_blocks", "avg_gems_per_block", "harvest_gems",
            "total_gems_didapat", "grow_time_seconds", "grow_time_readable",
        ]
        assert all(k in result for k in expected_keys)
        assert result["grow_time_seconds"] > 0
        assert isinstance(result["grow_time_readable"], str)
