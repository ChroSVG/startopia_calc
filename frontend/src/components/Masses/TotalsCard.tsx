import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Totals } from "@/hooks/useMassResults"

export function TotalsCard({ totals }: { totals: Totals }) {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-semibold">Totals</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
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
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Max Grow</span>
            <p className="font-bold tabular-nums text-lg">
              {totals.growReadable}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Total Price</span>
            <p className="font-bold tabular-nums text-lg">
              {totals.totalPrice.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
