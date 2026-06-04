import { Box, Clock, Hand, Pickaxe } from "lucide-react"
import type * as React from "react"
import DeleteFromInventory from "@/components/Inventory/DeleteFromInventory"
import EditInventory from "@/components/Inventory/EditInventory"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { BackpackItem } from "./BackpackSlot"

interface ItemDetailTooltipProps {
  item: BackpackItem
  children: React.ReactNode
}

const getRarityTextColor = (rarity?: string) => {
  const r = rarity?.toLowerCase()
  if (r === "common") return "text-slate-500"
  if (r === "uncommon") return "text-green-500"
  if (r === "rare") return "text-blue-500"
  if (r === "epic") return "text-purple-500"
  if (r === "legendary") return "text-amber-500"
  if (r === "exotic") return "text-red-500"
  return "text-muted-foreground"
}

export const ItemDetailTooltip = ({
  item,
  children,
}: ItemDetailTooltipProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 overflow-hidden bg-card border-2 shadow-xl"
        side="right"
        sideOffset={10}
      >
        {/* Header with Background Gradient */}
        <div
          className="p-4 border-b relative"
          style={{
            background: item.seed_color
              ? `linear-gradient(to bottom right, ${item.seed_color}33, transparent)`
              : undefined,
          }}
        >
          <div className="flex justify-between items-start gap-2 relative z-10">
            <div className="space-y-1 min-w-0">
              <h4 className="font-bold text-lg leading-tight truncate">
                {item.item_name}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.item_rarity && (
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      getRarityTextColor(item.item_rarity),
                    )}
                  >
                    {item.item_rarity}
                  </span>
                )}
                {item.item_type && (
                  <Badge
                    variant="secondary"
                    className="text-[9px] h-4 px-1 font-normal"
                  >
                    {item.item_type}
                  </Badge>
                )}
              </div>
            </div>
            {item.seed_color && (
              <div
                className="size-10 rounded-xl shadow-inner border-2 border-white/20 shrink-0"
                style={{ backgroundColor: item.seed_color.split(" ")[0] }}
              />
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-4">
          {item.item_description && (
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "{item.item_description}"
            </p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatItem
              icon={<Box className="size-3" />}
              label="Quantity"
              value={item.quantity}
            />
            {item.grow_time !== undefined && (
              <StatItem
                icon={<Clock className="size-3" />}
                label="Grow Time"
                value={`${item.grow_time}s`}
              />
            )}
            {item.hits_with_hand !== undefined && (
              <StatItem
                icon={<Hand className="size-3" />}
                label="Hand Hits"
                value={item.hits_with_hand}
              />
            )}
            {item.hits_with_pickaxe !== undefined && (
              <StatItem
                icon={<Pickaxe className="size-3" />}
                label="Pickaxe Hits"
                value={item.hits_with_pickaxe}
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-muted/30 p-3 flex items-center justify-between border-t gap-2">
          <div className="flex items-center gap-2">
            <EditInventory
              itemUid={item.uid}
              currentQuantity={item.quantity}
              itemName={item.item_name}
              asButton
            />
            <DeleteFromInventory id={item.uid} onSuccess={() => {}} asButton />
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            UID: {item.uid.substring(0, 8)}...
          </span>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="size-5 rounded bg-muted flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground leading-none">
          {label}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
    </div>
  )
}
