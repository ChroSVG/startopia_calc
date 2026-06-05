import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Totals } from "@/hooks/useMassResults"

export function TotalsCard({ totals }: { totals: Totals }) {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-semibold">Totals</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Total Trees</span>
            <p className="font-bold tabular-nums text-lg">
              {totals.totalTrees.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Total Blocks</span>
            <p className="font-bold tabular-nums text-lg">
              {totals.totalBlocks.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Total Smash</span>
            <p className="font-bold tabular-nums text-lg">
              {totals.totalSmash.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Total Seeds</span>
            <p className="font-bold tabular-nums text-lg">
              {totals.totalSeeds.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Total Gems</span>
            <p className="font-bold tabular-nums text-lg">
              {totals.totalGems.toLocaleString()}
              {totals.totalAutoBreakCost > 0 && (
                <span className="text-muted-foreground text-xs ml-1">
                  -{totals.totalAutoBreakCost.toLocaleString()}
                </span>
              )}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Gems Net</span>
            <p className={cn("font-bold tabular-nums text-lg", totals.totalGemsNet < 0 && "text-destructive")}>
              {totals.totalGemsNet.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Max Grow</span>
            <p className="font-bold tabular-nums text-lg">
              {totals.growReadable}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Total Modal</span>
            <p className="font-bold tabular-nums text-lg">
              {totals.totalModal.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Total Profit</span>
            <p className={cn("font-bold tabular-nums text-lg", totals.totalProfit < 0 && "text-destructive", totals.totalProfit >= 0 && "text-green-600")}>
              {totals.totalProfit >= 0 ? "+" : ""}{totals.totalProfit.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
