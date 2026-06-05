import { Trash2 } from "lucide-react"
import ItemSearch from "@/components/Masses/ItemSearch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
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
  variant?: "grid" | "list"
}

function MaxBlockIndicator({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-px" title={`Max Blocks: ${value}`}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            "size-2 rounded-[1.5px] transition-colors",
            i <= value ? "bg-primary" : "bg-muted",
          )}
        />
      ))}
    </div>
  )
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
  variant = "grid",
}: MassItemCardProps) {
  if (variant === "list") {
    return (
      <Card>
        <CardHeader className="pb-2 pt-2.5 px-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
            <div className="sm:col-span-4 space-y-1">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Item</Label>
                <MaxBlockIndicator value={item.maxBlocks} />
              </div>
              <ItemSearch
                compact
                selectedName={item.itemName || undefined}
                onSelect={(i) => onItemSelect(item.tempId, i)}
                onClear={() => onItemClear(item.tempId)}
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Trees</Label>
              <Input
                type="number"
                min={0}
                value={item.treeCount || ""}
                onChange={(e) =>
                  onTreesChange(item.tempId, parseInt(e.target.value, 10) || 0)
                }
                placeholder="0"
                className="h-7"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Buy</Label>
              <Input
                type="number"
                min={0}
                value={item.priceBuy || ""}
                onChange={(e) =>
                  onPriceBuyChange?.(item.tempId, parseInt(e.target.value, 10) || 0)
                }
                placeholder="0"
                className="h-7"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Sell</Label>
              <Input
                type="number"
                min={0}
                value={item.priceSell || ""}
                onChange={(e) =>
                  onPriceSellChange?.(item.tempId, parseInt(e.target.value, 10) || 0)
                }
                placeholder="0"
                className="h-7"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 pb-1">
              <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={item.isFuel}
                  onChange={(e) => onFuelChange?.(item.tempId, e.target.checked)}
                  className="size-3.5"
                />
                Fuel
              </label>
              <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
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
                  className="size-7 shrink-0 text-muted-foreground hover:text-destructive ml-auto"
                  onClick={() => onRemove(item.tempId)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {item.itemUid && result && (
          <CardContent className="px-3 pb-2.5 pt-0">
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

  return (
    <Card className="p-2 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <ItemSearch
            compact
            selectedName={item.itemName || undefined}
            onSelect={(i) => onItemSelect(item.tempId, i)}
            onClear={() => onItemClear(item.tempId)}
          />
        </div>
        <MaxBlockIndicator value={item.maxBlocks} />
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(item.tempId)}
          >
            <Trash2 className="size-3" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1">
        <div className="space-y-0.5">
          <Label className="text-[10px] leading-none text-muted-foreground">Trees</Label>
          <Input
            type="number"
            min={0}
            value={item.treeCount || ""}
            onChange={(e) => onTreesChange(item.tempId, parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            className="h-6 text-xs"
          />
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px] leading-none text-muted-foreground">Buy</Label>
          <Input
            type="number"
            min={0}
            value={item.priceBuy || ""}
            onChange={(e) => onPriceBuyChange?.(item.tempId, parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            className="h-6 text-xs"
          />
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px] leading-none text-muted-foreground">Sell</Label>
          <Input
            type="number"
            min={0}
            value={item.priceSell || ""}
            onChange={(e) => onPriceSellChange?.(item.tempId, parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            className="h-6 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-[10px] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={item.isFuel}
            onChange={(e) => onFuelChange?.(item.tempId, e.target.checked)}
            className="size-2.5"
          />
          Fuel
        </label>
        <label className="flex items-center gap-1 text-[10px] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={item.isAutoBreak}
            onChange={(e) => onAutoBreakChange?.(item.tempId, e.target.checked)}
            className="size-2.5"
          />
          Auto
        </label>
      </div>

      {item.itemUid && result && (
        <div className="grid grid-cols-4 gap-x-1.5 text-[9px] pt-1 border-t text-muted-foreground">
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
