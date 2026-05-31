import { useQuery } from "@tanstack/react-query"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"
import { useDebounce } from "use-debounce"

import { ItemsService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ItemSelectorProps {
  value: string
  onChange: (value: string) => void
}

const ItemSelector = ({ value, onChange }: ItemSelectorProps) => {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300)

  // 1. Scalable Server-side Search: Query matching items from database up to 50 results
  const { data, isLoading } = useQuery({
    queryKey: ["admin-items", debouncedSearchQuery],
    queryFn: () =>
      ItemsService.readItems({
        skip: 0,
        limit: 50,
        search: debouncedSearchQuery,
      }),
  })

  // 2. Query individual details of currently selected item to guarantee name display
  const { data: selectedItem } = useQuery({
    queryKey: ["admin-item", value],
    queryFn: () => ItemsService.readItem({ itemUid: value }),
    enabled: !!value,
  })

  const items = data?.data ?? []

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("")
    }
  }, [open])

  // Combine items to ensure the selected item is present in the rendered dropdown list
  const dropdownItems = React.useMemo(() => {
    if (!selectedItem) return items
    if (items.some((item) => item.uid === selectedItem.uid)) return items
    return [...items, selectedItem]
  }, [items, selectedItem])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedItem
            ? selectedItem.name
            : isLoading
              ? "Loading items..."
              : "Select an item..."}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search items..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Loading items...
              </div>
            ) : dropdownItems.length === 0 ? (
              <CommandEmpty>No items found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {dropdownItems.map((item) => (
                  <CommandItem
                    key={item.uid}
                    value={item.name}
                    onSelect={() => {
                      onChange(item.uid)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === item.uid ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {item.name}
                    {item.rarity && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({item.rarity})
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default ItemSelector
