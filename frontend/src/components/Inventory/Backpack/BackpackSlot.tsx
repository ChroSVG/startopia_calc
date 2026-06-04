import * as React from "react"
import { cn } from "@/lib/utils"

export interface BackpackItem {
  uid: string
  item_uid: string
  quantity: number
  item_name: string
  item_type?: string
  item_rarity?: string
  item_description?: string
  seed_color?: string | null
  [key: string]: any
}

interface BackpackSlotProps {
  item?: BackpackItem
  isAddSlot?: boolean
  onClick?: () => void
  className?: string
}

const getRarityColor = (rarity?: string) => {
  const r = rarity?.toLowerCase()
  if (r === "common") return "border-slate-400/50 bg-slate-400/10"
  if (r === "uncommon") return "border-green-400/50 bg-green-400/10"
  if (r === "rare") return "border-blue-400/50 bg-blue-400/10"
  if (r === "epic") return "border-purple-400/50 bg-purple-400/10"
  if (r === "legendary") return "border-amber-400/50 bg-amber-400/10"
  if (r === "exotic") return "border-red-400/50 bg-red-400/10"
  return "border-muted bg-muted/30"
}

export const BackpackSlot = React.forwardRef<HTMLButtonElement, BackpackSlotProps>(
  ({ item, isAddSlot, onClick, className, ...props }, ref) => {
    if (isAddSlot) {
      return (
        <button
          type="button"
          ref={ref}
          onClick={onClick}
          className={cn(
            "relative aspect-square w-full rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/10 hover:bg-muted/20 hover:border-primary/50 transition-all cursor-pointer flex items-center justify-center group",
            className,
          )}
          {...props}
        >
          <div className="size-8 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center group-hover:border-primary/50 group-hover:text-primary transition-colors text-muted-foreground/50">
            <span className="text-2xl font-light">+</span>
          </div>
        </button>
      )
    }

    if (!item) return null

    // Parse seed color to use as a subtle gradient
    const backgroundStyle = item.seed_color
      ? {
          background: `radial-gradient(circle at center, ${item.seed_color}22 0%, transparent 70%)`,
        }
      : {}

    return (
      <button
        type="button"
        ref={ref}
        onClick={onClick}
        style={backgroundStyle}
        className={cn(
          "relative aspect-square w-full rounded-lg border-2 transition-all cursor-pointer overflow-hidden",
          getRarityColor(item.item_rarity),
          "hover:ring-2 hover:ring-primary/40 hover:scale-[1.02] active:scale-95",
          className,
        )}
        {...props}
      >
        {/* Item "Image" / Visual Representation */}
        <div className="flex items-center justify-center h-full p-2">
          {item.seed_color ? (
            <div className="flex flex-col items-center gap-1">
              <div
                className="size-6 rounded-full shadow-sm border border-white/20"
                style={{ backgroundColor: item.seed_color.split(" ")[0] }}
              />
              <span className="text-[10px] font-bold text-center leading-tight truncate max-w-full px-1">
                {item.item_name.split(" ")[0]}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold opacity-20">
              {item.item_name[0]}
            </span>
          )}
        </div>

        {/* Quantity Badge */}
        <div className="absolute bottom-0 right-0 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] text-white rounded-tl-md font-mono font-bold border-t border-l border-white/10 shadow-sm">
          {item.quantity >= 1000
            ? `${(item.quantity / 1000).toFixed(1)}k`
            : item.quantity}
        </div>

        {/* Rarity Glow (Optional) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-tr from-transparent via-transparent to-white/10" />
      </button>
    )
  },
)

BackpackSlot.displayName = "BackpackSlot"
