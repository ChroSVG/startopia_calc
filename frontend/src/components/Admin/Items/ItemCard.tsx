import { EllipsisVertical, HandFist, Pickaxe, Timer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AdminItemTableData } from "./columns"
import { ItemActionsMenu } from "./ItemActionsMenu"

function GrowTime({ seconds }: { seconds: number | null | undefined }) {
  if (!seconds) return null
  if (seconds >= 86400) return `${(seconds / 86400).toFixed(1)}d`
  if (seconds >= 3600) return `${(seconds / 3600).toFixed(1)}h`
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  return `${seconds}s`
}

function SeedColor({ color }: { color: string | null | undefined }) {
  if (!color) return null
  const colors = color.split(" ")
  return (
    <div className="flex gap-0.5">
      {colors.map((c) => (
        <span
          key={c}
          className="inline-block size-4 rounded border"
          style={{ backgroundColor: c }}
          title={c}
        />
      ))}
    </div>
  )
}

interface ItemCardProps {
  item: AdminItemTableData
}

const ItemCard = ({ item }: ItemCardProps) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate">{item.name}</h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {item.type && (
              <span className="text-[11px] bg-muted px-1.5 py-0.5 rounded">
                {item.type}
              </span>
            )}
            {item.rarity && (
              <Badge variant="outline" className="text-[11px]">
                {item.rarity}
              </Badge>
            )}
            {item.chi && (
              <span className="text-[11px] text-muted-foreground">
                {item.chi}
              </span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground rounded-md p-1 -mr-1 -mt-1">
              <EllipsisVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <ItemActionsMenu item={item} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-xs">
        {item.grow_time != null && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Timer className="size-3.5 shrink-0" />
            <span>
              Grow:{" "}
              <span className="text-foreground">
                <GrowTime seconds={item.grow_time} />
              </span>
            </span>
          </div>
        )}
        {item.max_drop != null && (
          <div className="text-muted-foreground">
            Max Drop: <span className="text-foreground">{item.max_drop}</span>
          </div>
        )}
        {item.default_gems_drop && (
          <div className="text-muted-foreground">
            Gems:{" "}
            <span className="text-foreground">{item.default_gems_drop}</span>
          </div>
        )}
        {(item.hits_with_hand != null ||
          item.hits_with_pickaxe != null ||
          item.restore_time_seconds != null) && (
          <div className="flex items-center gap-2.5 text-muted-foreground col-span-2 mt-0.5">
            {item.hits_with_hand != null && (
              <span className="inline-flex items-center gap-0.5">
                <HandFist className="size-3" />
                {item.hits_with_hand}
              </span>
            )}
            {item.hits_with_pickaxe != null && (
              <span className="inline-flex items-center gap-0.5">
                <Pickaxe className="size-3" />
                {item.hits_with_pickaxe}
              </span>
            )}
            {item.restore_time_seconds != null && (
              <span className="inline-flex items-center gap-0.5">
                <Timer className="size-3" />
                <GrowTime seconds={item.restore_time_seconds} />
              </span>
            )}
          </div>
        )}
        {item.scraped != null && (
          <div className="text-muted-foreground">
            Scraped:{" "}
            <span className={item.scraped ? "text-emerald-500" : "text-foreground"}>
              {item.scraped ? "✓" : "—"}
            </span>
          </div>
        )}
        {item.texture_type && (
          <div className="text-muted-foreground">
            Texture:{" "}
            <span className="text-foreground">{item.texture_type}</span>
          </div>
        )}
        {item.seed_color && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>Seed:</span>
            <SeedColor color={item.seed_color} />
          </div>
        )}
        {item.collision_type && (
          <div className="text-muted-foreground">
            Collision:{" "}
            <span className="text-foreground">{item.collision_type}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemCard
