import { Trash2 } from "lucide-react"
import ItemSearch from "@/components/Masses/ItemSearch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
    <Card className="relative">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Item</Label>
            <ItemSearch
              selectedName={item.itemName || undefined}
              onSelect={(i) => onItemSelect(item.tempId, i)}
              onClear={() => onItemClear(item.tempId)}
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max Blocks</Label>
            <Input
              type="number"
              min={1}
              max={4}
              value={item.maxBlocks}
              disabled
              className="h-8"
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Trees</Label>
            <Input
              type="number"
              min={0}
              value={item.treeCount || ""}
              onChange={(e) =>
                onTreesChange(item.tempId, parseInt(e.target.value, 10) || 0)
              }
              placeholder="0"
              className="h-8"
            />
          </div>
          <div className="sm:col-span-1 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Buy</Label>
            <Input
              type="number"
              min={0}
              value={item.priceBuy || ""}
              onChange={(e) =>
                onPriceBuyChange?.(item.tempId, parseInt(e.target.value, 10) || 0)
              }
              placeholder="0"
              className="h-8"
            />
          </div>
          <div className="sm:col-span-1 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Sell</Label>
            <Input
              type="number"
              min={0}
              value={item.priceSell || ""}
              onChange={(e) =>
                onPriceSellChange?.(item.tempId, parseInt(e.target.value, 10) || 0)
              }
              placeholder="0"
              className="h-8"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2 pb-1">
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={item.isFuel}
                onChange={(e) => onFuelChange?.(item.tempId, e.target.checked)}
                className="size-3.5"
              />
              Fuel
            </label>
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={item.isAutoBreak}
                onChange={(e) => onAutoBreakChange?.(item.tempId, e.target.checked)}
                className="size-3.5"
              />
              Auto
            </label>
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive ml-auto"
                onClick={() => onRemove(item.tempId)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {item.itemUid && result && (
        <CardContent className="px-4 pb-3 pt-0">
          <Separator className="mb-2" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Blok</span>
              <p className="font-medium tabular-nums">
                {result.blok_yielded.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Smash</span>
              <p className="font-medium tabular-nums">
                {result.total_smash_efektif.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Seeds</span>
              <p className="font-medium tabular-nums">
                {result.total_seeds_return.toLocaleString()}{" "}
                <span className="text-muted-foreground">
                  ({result.seed_return_rate}%)
                </span>
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Gems</span>
              <p className="font-medium tabular-nums">
                {result.total_gems_didapat.toLocaleString()}
                {result.auto_break_cost > 0 && (
                  <span className="text-muted-foreground text-[10px] ml-1">
                    -{result.auto_break_cost.toLocaleString()}
                  </span>
                )}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Grow</span>
              <p className="font-medium tabular-nums">
                {result.grow_time_readable}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Gems/Block</span>
              <p className="font-medium tabular-nums">
                {result.avg_gems_per_block}
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
