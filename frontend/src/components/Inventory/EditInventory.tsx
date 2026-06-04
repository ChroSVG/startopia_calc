import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Minus, Pencil, Plus, Scale, Sparkles } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
})

type FormData = z.infer<typeof formSchema>

interface EditInventoryProps {
  itemUid: string
  currentQuantity: number
  itemName: string
  onSuccess?: () => void
  asButton?: boolean
}

const EditInventory = ({
  itemUid,
  currentQuantity,
  itemName,
  onSuccess,
  asButton,
}: EditInventoryProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      quantity: currentQuantity,
    },
  })

  const watchedQuantity = form.watch("quantity")

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      InventoryService.updateInventoryItem({
        itemUid,
        requestBody: { quantity: data.quantity },
      }),
    onSuccess: () => {
      showSuccessToast("Quantity updated!")
      setIsOpen(false)
      onSuccess?.()
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
  }

  const trigger = asButton ? (
    <Button
      variant="ghost"
      size="icon"
      className="size-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all border-2 border-transparent hover:border-primary/20"
      onClick={() => {
        form.reset({ quantity: currentQuantity })
        setIsOpen(true)
      }}
    >
      <Pencil className="size-4" />
    </Button>
  ) : (
    <DropdownMenuItem
      onSelect={(e) => e.preventDefault()}
      onClick={() => {
        form.reset({ quantity: currentQuantity })
        setIsOpen(true)
      }}
      className="gap-2 font-bold"
    >
      <Pencil className="size-4" />
      Edit Quantity
    </DropdownMenuItem>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger}
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-2 rounded-[2rem] shadow-2xl">
        <div className="bg-primary/5 p-6 border-b-2 border-dashed">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner">
                <Scale className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight uppercase italic">
                  Modify Amount
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-muted-foreground truncate max-w-[240px]">
                  Updating{" "}
                  <span className="text-foreground font-bold">{itemName}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-8"
          >
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Sparkles className="size-3" />
                      Adjust Quantity
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-2xl border-2 border-dashed">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="size-12 shrink-0 rounded-xl border-2 shadow-sm active:scale-95 transition-all"
                          disabled={watchedQuantity <= 1}
                          onClick={() =>
                            field.onChange(Math.max(1, watchedQuantity - 1))
                          }
                        >
                          <Minus className="size-5" />
                        </Button>
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black italic tracking-tighter">
                            {watchedQuantity}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">
                            pieces
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="size-12 shrink-0 rounded-xl border-2 shadow-sm active:scale-95 transition-all"
                          onClick={() => field.onChange(watchedQuantity + 1)}
                        >
                          <Plus className="size-5" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />
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
                type="submit"
                loading={mutation.isPending}
                className="flex-[2] rounded-xl font-black italic tracking-tight uppercase shadow-lg shadow-primary/20"
              >
                UPDATE BACKPACK
              </LoadingButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditInventory
