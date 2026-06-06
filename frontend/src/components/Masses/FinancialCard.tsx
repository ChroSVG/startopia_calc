import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Totals } from "@/hooks/useMassResults"
import { cn } from "@/lib/utils"

export function FinancialCard({ totals }: { totals: Totals }) {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-semibold">Financial</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Omset (WL)</span>
            <p className="font-bold tabular-nums text-lg text-green-600">
              +{totals.totalOmset.toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Biaya (WL)</span>
            <p className="font-bold tabular-nums text-lg text-destructive">
              -{totals.totalBiaya.toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Profit (WL)</span>
            <p
              className={cn(
                "font-bold tabular-nums text-lg",
                totals.totalProfit < 0 && "text-destructive",
                totals.totalProfit >= 0 && "text-green-600",
              )}
            >
              {totals.totalProfit >= 0 ? "+" : ""}
              {totals.totalProfit.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
