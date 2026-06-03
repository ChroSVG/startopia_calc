import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  Plus, 
  Search, 
  Package, 
  ChevronRight, 
  Minus, 
  Loader2, 
  ArrowLeft,
  Sparkles
} from "lucide-react"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"

import { ItemsService, InventoryService, type InventoryCreateModel, type ItemModel } from "@/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface AddToInventoryProps {
  trigger?: React.ReactNode
}

const AddToInventory = ({ trigger }: AddToInventoryProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch] = useDebounce(searchQuery, 400)
  const [selectedItem, setSelectedItem] = useState<ItemModel | null>(null)
  const [quantity, setQuantity] = useState(1)

  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // 1. Fetch items based on search
  const { data: itemsData, isLoading: isLoadingItems } = useQuery({
    queryKey: ["admin-items", debouncedSearch],
    queryFn: () => ItemsService.readItems({
      search: debouncedSearch,
      limit: 20,
    }),
    enabled: isOpen,
  })

  const items = itemsData?.data ?? []

  // Reset local state when sheet closes or search changes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("")
      setSelectedItem(null)
      setQuantity(1)
    }
  }, [isOpen])

  const mutation = useMutation({
    mutationFn: (data: InventoryCreateModel) =>
      InventoryService.addToInventory({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast(`${selectedItem?.name} added to backpack!`)
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
  })

  const handleAdd = () => {
    if (!selectedItem) return
    mutation.mutate({
      item_uid: selectedItem.uid,
      quantity: quantity,
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="group relative overflow-hidden rounded-xl bg-primary px-6 py-6 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
             <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <Plus className="mr-2 size-5 transition-transform group-hover:rotate-90" />
             <span className="font-bold tracking-tight uppercase">Add to Backpack</span>
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent side="right" className="flex w-full flex-col border-l-2 p-0 sm:max-w-md">
        {/* Header */}
        <div className="bg-primary/5 p-6 border-b-2 border-dashed">
            <SheetHeader className="p-0">
               <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner">
                    <Package className="size-6" />
                  </div>
                  <div className="space-y-0.5">
                    <SheetTitle className="text-2xl font-black italic tracking-tight uppercase leading-none">Find Items</SheetTitle>
                    <SheetDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Resource Finder</SheetDescription>
                  </div>
               </div>
            </SheetHeader>
        </div>

        {/* Search Bar (Sticky-ish) */}
        {!selectedItem && (
          <div className="px-6 py-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Type item name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-12 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 focus-visible:ring-0 transition-all font-medium"
                />
                {isLoadingItems && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
                )}
             </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6">
          {selectedItem ? (
            /* Selected Item View */
            <div className="py-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedItem(null)}
                className="rounded-full -ml-2 text-muted-foreground hover:text-foreground"
               >
                 <ArrowLeft className="mr-2 size-4" />
                 Back to results
               </Button>

               <div className="space-y-6">
                  {/* Hero Item Card */}
                  <div 
                    className="relative aspect-square w-48 mx-auto rounded-3xl border-4 shadow-2xl flex items-center justify-center overflow-hidden"
                    style={{ 
                        borderColor: selectedItem.seed_color ? `${selectedItem.seed_color}44` : 'var(--muted)',
                        background: selectedItem.seed_color ? `radial-gradient(circle at center, ${selectedItem.seed_color}22, transparent)` : 'var(--muted/10)'
                    }}
                  >
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,_var(--foreground)_1px,_transparent_0)] bg-[size:24px_24px]" />
                    {selectedItem.seed_color ? (
                       <div 
                        className="size-24 rounded-full shadow-2xl border-4 border-white/20 animate-pulse" 
                        style={{ backgroundColor: selectedItem.seed_color.split(' ')[0] }}
                       />
                    ) : (
                      <Package className="size-24 text-muted-foreground/20" />
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">{selectedItem.name}</h2>
                    <div className="flex items-center justify-center gap-2">
                       {selectedItem.rarity && (
                         <Badge variant="outline" className="uppercase font-black italic tracking-widest text-[10px]">
                           {selectedItem.rarity}
                         </Badge>
                       )}
                       <Badge variant="secondary" className="uppercase font-bold text-[10px]">
                         {selectedItem.type || 'Resource'}
                       </Badge>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="bg-muted/30 p-6 rounded-[2rem] border-2 border-dashed space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Amount to add</span>
                        <Sparkles className="size-4 text-primary" />
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-14 rounded-2xl border-2 shadow-sm active:scale-90 transition-all"
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="size-6" />
                        </Button>
                        <div className="flex-1 flex flex-col items-center justify-center bg-background rounded-2xl border-2 h-14">
                           <span className="text-2xl font-black italic tracking-tighter">{quantity}</span>
                        </div>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-14 rounded-2xl border-2 shadow-sm active:scale-90 transition-all"
                          onClick={() => setQuantity(q => q + 1)}
                        >
                          <Plus className="size-6" />
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            /* Search Results View */
            <div className="py-2 space-y-2">
              {items.length > 0 ? (
                items.map((item) => (
                  <button
                    key={item.uid}
                    onClick={() => setSelectedItem(item)}
                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 border-2 border-transparent hover:border-muted transition-all text-left group"
                  >
                    <div 
                      className="size-12 rounded-xl border-2 shrink-0 flex items-center justify-center relative overflow-hidden"
                      style={{ 
                        backgroundColor: item.seed_color ? `${item.seed_color}11` : 'transparent',
                        borderColor: item.seed_color ? `${item.seed_color}33` : 'var(--muted)'
                      }}
                    >
                      {item.seed_color ? (
                        <div 
                          className="size-6 rounded-full border border-white/20" 
                          style={{ backgroundColor: item.seed_color.split(' ')[0] }}
                        />
                      ) : (
                        <Package className="size-6 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate group-hover:text-primary transition-colors italic uppercase tracking-tight">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{item.rarity || 'Common'} • {item.type || 'Item'}</div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))
              ) : debouncedSearch ? (
                <div className="py-20 text-center">
                   <div className="size-16 rounded-3xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                      <Search className="size-8 text-muted-foreground/30" />
                   </div>
                   <h3 className="font-bold text-muted-foreground">No matches found</h3>
                   <p className="text-xs text-muted-foreground/50 uppercase tracking-widest mt-1">Try another keyword</p>
                </div>
              ) : (
                <div className="py-20 text-center opacity-40">
                   <Sparkles className="size-12 mx-auto mb-4 text-primary animate-pulse" />
                   <p className="text-xs font-black uppercase tracking-[0.2em]">Start typing to explore items</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedItem && (
          <div className="p-6 bg-background border-t-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <LoadingButton
              className="w-full h-16 rounded-[1.5rem] font-black italic text-xl tracking-tight uppercase shadow-xl shadow-primary/20"
              loading={mutation.isPending}
              onClick={handleAdd}
            >
              Add to Backpack
            </LoadingButton>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default AddToInventory
