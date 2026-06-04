import { useSuspenseQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { InventoryService, ItemsService } from "@/client"

function getInventoryQueryOptions() {
  return {
    queryFn: () => InventoryService.readInventory({ skip: 0, limit: 100 }),
    queryKey: ["inventory"],
  }
}

function getItemsQueryOptions() {
  return {
    queryFn: () => ItemsService.readItems({ skip: 0, limit: 2000 }),
    queryKey: ["admin-items"],
  }
}

export interface AugmentedInventoryItem {
  uid: string
  item_uid: string
  quantity: number
  created_at: string
  item_name: string
  item_type: string
  item_rarity: string
  item_description: string
}

export function useAugmentedInventory() {
  const { data: inventory } = useSuspenseQuery(getInventoryQueryOptions())
  const { data: itemsData } = useSuspenseQuery(getItemsQueryOptions())
  const items = itemsData?.data ?? []

  const augmentedData = useMemo(() => {
    return inventory.data.map((invItem) => {
      const itemInfo = items.find((item) => item.uid === invItem.item_uid)
      return {
        ...invItem,
        item_name: itemInfo?.name ?? "Unknown Item",
        item_type: itemInfo?.type ?? "Unknown",
        item_rarity: itemInfo?.rarity ?? "",
        item_description: itemInfo?.description ?? "",
      } as AugmentedInventoryItem
    })
  }, [inventory.data, items])

  return { inventory: inventory.data, augmentedData }
}
