import { Trash2 } from "lucide-react"
import ItemSearch from "@/components/Masses/ItemSearch"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { MassItemResult } from "@/utils/massCalculator"
import type { CalculatorItem } from "@/utils/massTypes"

interface MassItemCardProps {
  item: CalculatorItem
  result: MassItemResult | undefined
  onItemSelect: (tempId: string, item: import("@/client").ItemModel) => void
  onItemClear: (tempId: string) => void
  onTreesChange: (tempId: string, trees: number) => void
  onPriceBuyChange?: (tempId: string, price: number) => void
  onPriceSellChange?: (tempId: string, price: number) => void
  onFuelChange?: (tempId: string, isFuel: boolean) => void
  onAutoBreakChange?: (tempId: string, isAutoBreak: boolean) => void
  onRemove?: (tempId: string) => void
}

export function MassItemCard({
  item,
  result,
  onItemSelect,
  onItemClear,
  onTreesChange,
  onPriceBuyChange,
  onPriceSellChange,
  onFuelChange,
  onAutoBreakChange,
  onRemove,
}: MassItemCardProps) {
  return (
    <Card className="p-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <ItemSearch
            compact
            selectedName={item.itemName || undefined}
            onSelect={(i) => onItemSelect(item.tempId, i)}
            onClear={() => onItemClear(item.tempId)}
          />
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(item.tempId)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <Input
          type="number"
          min={0}
          value={item.treeCount || ""}
          onChange={(e) => onTreesChange(item.tempId, parseInt(e.target.value, 10) || 0)}
          placeholder="Trees"
          className="h-7 text-xs"
        />
        <Input
          type="number"
          min={0}
          value={item.priceBuy || ""}
          onChange={(e) => onPriceBuyChange?.(item.tempId, parseInt(e.target.value, 10) || 0)}
          placeholder="Buy"
          className="h-7 text-xs"
        />
        <Input
          type="number"
          min={0}
          value={item.priceSell || ""}
          onChange={(e) => onPriceSellChange?.(item.tempId, parseInt(e.target.value, 10) || 0)}
          placeholder="Sell"
          className="h-7 text-xs"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={item.isFuel}
            onChange={(e) => onFuelChange?.(item.tempId, e.target.checked)}
            className="size-3"
          />
          Fuel
        </label>
        <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={item.isAutoBreak}
            onChange={(e) => onAutoBreakChange?.(item.tempId, e.target.checked)}
            className="size-3"
          />
          Auto
        </label>
      </div>

      {item.itemUid && result && (
        <div className="grid grid-cols-4 gap-x-2 gap-y-0.5 text-[10px] pt-1.5 border-t text-muted-foreground">
          <div>
            <span>Blok </span>
            <span className="font-medium text-foreground">{result.blok_yielded.toLocaleString()}</span>
          </div>
          <div>
            <span>Smash </span>
            <span className="font-medium text-foreground">{result.total_smash_efektif.toLocaleString()}</span>
          </div>
          <div>
            <span>Seeds </span>
            <span className="font-medium text-foreground">{result.total_seeds_return.toLocaleString()}</span>
          </div>
          <div>
            <span>Gems </span>
            <span className="font-medium text-foreground">{result.total_gems_didapat.toLocaleString()}</span>
          </div>
        </div>
      )}
    </Card>
  )
}
