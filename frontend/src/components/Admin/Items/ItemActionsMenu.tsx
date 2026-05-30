import type { ItemModel as Item } from "@/client"
import DeleteItem from "./DeleteItem"
import EditItem from "./EditItem"

interface ItemActionsMenuProps {
  item: Item
}

export const ItemActionsMenu = ({ item }: ItemActionsMenuProps) => {
  return (
    <>
      <EditItem item={item} />
      <DeleteItem id={item.uid} />
    </>
  )
}
