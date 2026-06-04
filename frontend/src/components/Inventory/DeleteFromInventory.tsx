import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, ShieldAlert, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { InventoryService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface DeleteFromInventoryProps {
  id: string
  onSuccess: () => void
  asButton?: boolean
}

const DeleteFromInventory = ({
  id,
  onSuccess,
  asButton,
}: DeleteFromInventoryProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { handleSubmit } = useForm()

  const mutation = useMutation({
    mutationFn: (itemUid: string) =>
      InventoryService.deleteFromInventory({ itemUid }),
    onSuccess: () => {
      showSuccessToast("Item removed from backpack")
      setIsOpen(false)
      onSuccess()
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
  })

  const onSubmit = async () => {
    mutation.mutate(id)
  }

  const trigger = asButton ? (
    <Button
      variant="ghost"
      size="icon"
      className="size-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all border-2 border-transparent hover:border-destructive/20"
      onClick={() => setIsOpen(true)}
    >
      <Trash2 className="size-4" />
    </Button>
  ) : (
    <DropdownMenuItem
      variant="destructive"
      onSelect={(e) => e.preventDefault()}
      onClick={() => setIsOpen(true)}
      className="gap-2 font-bold"
    >
      <Trash2 className="size-4" />
      Remove
    </DropdownMenuItem>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger}
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-2 rounded-[2rem] shadow-2xl">
        <div className="bg-destructive/5 p-6 border-b-2 border-dashed border-destructive/20">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="size-10 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive border-2 border-destructive/20 shadow-inner">
                <ShieldAlert className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight uppercase italic">
                  Remove Item
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-muted-foreground">
                  Action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/50 border-2 border-dashed">
            <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">
              Are you sure you want to discard this item from your backpack? It
              will be permanently removed from your collection.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="flex-1 rounded-xl font-bold text-muted-foreground hover:bg-muted"
                disabled={mutation.isPending}
              >
                CANCEL
              </Button>
            </DialogClose>
            <LoadingButton
              variant="destructive"
              type="submit"
              loading={mutation.isPending}
              className="flex-[2] rounded-xl font-black italic tracking-tight uppercase shadow-lg shadow-destructive/20"
            >
              DISCARD ITEM
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteFromInventory
