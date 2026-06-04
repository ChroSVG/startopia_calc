import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DeleteFromInventory from "@/components/Inventory/DeleteFromInventory"
import type { AugmentedInventoryItem } from "@/hooks/useAugmentedInventory"

export function InventoryCardGrid({
  items,
}: {
  items: AugmentedInventoryItem[]
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((invItem) => (
        <Card
          key={invItem.uid}
          className="overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold leading-tight">
                  {invItem.item_name}
                </CardTitle>
                {invItem.item_type && (
                  <Badge variant="outline" className="text-[10px]">
                    {invItem.item_type}
                  </Badge>
                )}
              </div>
              {invItem.item_rarity && (
                <Badge
                  variant="secondary"
                  className="text-[10px] shrink-0 font-medium"
                >
                  {invItem.item_rarity}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-4 pt-2 grow">
            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
              {invItem.item_description || "No description available."}
            </p>
            <div className="flex items-center justify-between text-xs bg-muted/50 p-2.5 rounded-lg">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-bold text-sm">{invItem.quantity}</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 border-t bg-muted/10 flex items-center justify-between px-4 h-11">
            <span className="text-[10px] text-muted-foreground">
              Added {new Date(invItem.created_at).toLocaleDateString()}
            </span>
            <DeleteFromInventory id={invItem.uid} onSuccess={() => {}} asButton />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
