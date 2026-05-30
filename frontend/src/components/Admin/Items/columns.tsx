import type { ColumnDef } from "@tanstack/react-table"

import type { ItemModel as Item } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical, HandFist, Pickaxe, Timer } from "lucide-react"
import { ItemActionsMenu } from "./ItemActionsMenu"

export type AdminItemTableData = Item & {}

function GrowTime({ seconds }: { seconds: number | null | undefined }) {
  if (!seconds) return <span className="text-muted-foreground">—</span>
  if (seconds >= 86400) return `${(seconds / 86400).toFixed(1)}d`
  if (seconds >= 3600) return `${(seconds / 3600).toFixed(1)}h`
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  return `${seconds}s`
}

function SeedColor({ color }: { color: string | null | undefined }) {
  if (!color) return <span className="text-muted-foreground">—</span>
  const colors = color.split(" ")
  return (
    <div className="flex gap-0.5">
      {colors.map((c, i) => (
        <span
          key={i}
          className="inline-block size-4 rounded border"
          style={{ backgroundColor: c }}
          title={c}
        />
      ))}
    </div>
  )
}

function CollisionBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>
  const v = value.toLowerCase()
  const label =
    v.includes("no collision if turned off") || v.includes("conditional") ? "Conditional"
    : v.includes("none") || v.includes("no collision") ? "None"
    : v.includes("full") ? "Full"
    : value.length > 12 ? value.slice(0, 10) + "…" : value
  const color =
    label === "Full" ? "bg-red-500/10 text-red-500 border-red-500/30"
    : label === "None" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
    : label === "Conditional" ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
    : "bg-muted text-muted-foreground"
  return (
    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${color}`}>
      {label}
    </span>
  )
}

export const columns: ColumnDef<AdminItemTableData>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium whitespace-nowrap">{row.original.name}</span>
    ),
    meta: { sticky: true },
  },
  {
    accessorKey: "rarity",
    header: "Rarity",
    cell: ({ row }) => {
      const r = row.original.rarity
      return r ? <Badge variant="outline" className="text-[11px]">{r}</Badge> : <span className="text-muted-foreground text-xs">—</span>
    },
    meta: { filterable: true },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const t = row.original.type
      return t ? (
        <span className="text-[11px] whitespace-nowrap">{t}</span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      )
    },
    meta: { filterable: true },
  },
  {
    accessorKey: "chi",
    header: "Chi",
    cell: ({ row }) => {
      const v = row.original.chi
      return v ? <span className="text-[11px]">{v}</span> : <span className="text-muted-foreground text-xs">—</span>
    },
    meta: { filterable: true },
  },
  {
    accessorKey: "grow_time",
    header: "Grow Time",
    cell: ({ row }) => <GrowTime seconds={row.original.grow_time} />,
  },
  {
    id: "mechanics",
    header: "Mechanics",
    meta: { toggleable: true, defaultHidden: true },
    cell: ({ row }) => {
      const hand = row.original.hits_with_hand
      const pick = row.original.hits_with_pickaxe
      const restore = row.original.restore_time_seconds
      return (
        <div className="flex items-center gap-3 text-[11px] whitespace-nowrap">
          {hand != null && (
            <span className="inline-flex items-center gap-0.5 text-muted-foreground">
              <HandFist className="size-3" />
              {hand}
            </span>
          )}
          {pick != null && (
            <span className="inline-flex items-center gap-0.5 text-muted-foreground">
              <Pickaxe className="size-3" />
              {pick}
            </span>
          )}
          {restore != null && (
            <span className="inline-flex items-center gap-0.5 text-muted-foreground">
              <Timer className="size-3" />
              <GrowTime seconds={restore} />
            </span>
          )}
          {hand == null && pick == null && restore == null && (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "max_drop",
    header: "Max Drop",
    cell: ({ row }) => {
      const v = row.original.max_drop
      return v != null ? <span className="text-xs">{v}</span> : <span className="text-muted-foreground text-xs">—</span>
    },
  },
  {
    accessorKey: "default_gems_drop",
    header: "Gems Drop",
    cell: ({ row }) => {
      const v = row.original.default_gems_drop
      return v ? <span className="text-xs">{v}</span> : <span className="text-muted-foreground text-xs">—</span>
    },
  },
  {
    accessorKey: "seed_color",
    header: "Seed Color",
    cell: ({ row }) => <SeedColor color={row.original.seed_color} />,
    meta: { toggleable: true },
  },
  {
    accessorKey: "texture_type",
    header: "Texture",
    cell: ({ row }) => {
      const v = row.original.texture_type
      return v ? <span className="text-[11px]">{v}</span> : <span className="text-muted-foreground text-xs">—</span>
    },
    meta: { toggleable: true },
  },
  {
    accessorKey: "collision_type",
    header: "Collision",
    cell: ({ row }) => <CollisionBadge value={row.original.collision_type} />,
    meta: { toggleable: true, defaultHidden: true, filterable: true },
  },
  {
    accessorKey: "scraped",
    header: "Scraped",
    cell: ({ row }) =>
      row.original.scraped ? (
        <span className="text-emerald-500 text-sm">✓</span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      ),
    meta: { toggleable: true, filterable: true },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <EllipsisVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <ItemActionsMenu item={row.original} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]
