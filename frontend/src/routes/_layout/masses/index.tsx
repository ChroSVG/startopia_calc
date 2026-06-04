import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Calculator, Trash2 } from "lucide-react"
import { Suspense } from "react"

import { MassesService } from "@/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AddMassDialog from "@/components/Masses/AddMassDialog"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

function getMassesQueryOptions() {
  return {
    queryFn: () => MassesService.readMasses({ skip: 0, limit: 100 }),
    queryKey: ["masses"],
  }
}

export const Route = createFileRoute("/_layout/masses/")({
  component: MassesIndex,
  head: () => ({
    meta: [{ title: "Masses - Startopia Calc" }],
  }),
})

function MassesListContent() {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { data: masses } = useSuspenseQuery(getMassesQueryOptions())

  const deleteMutation = useMutation({
    mutationFn: (massUid: string) =>
      MassesService.deleteMass({ massUid }),
    onSuccess: () => {
      showSuccessToast("Mass deleted")
      queryClient.invalidateQueries({ queryKey: ["masses"] })
    },
    onError: handleError.bind(showErrorToast),
  })

  if (masses.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Calculator className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No saved masses yet</h3>
        <p className="text-muted-foreground mt-1 mb-6">
          Create a new mass to start calculating tree yields.
        </p>
        <AddMassDialog />
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {masses.data.map((mass) => (
        <Link
          key={mass.uid}
          to="/masses/$massUid"
          params={{ massUid: mass.uid }}
          className="block"
        >
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{mass.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {mass.items?.length ?? 0} items &middot;{" "}
                    {mass.mode.toUpperCase()}
                    {mass.description && (
                      <> &middot; {mass.description}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/masses/${mass.uid}`
                    }}
                  >
                    <Calculator className="size-3.5 mr-1.5" />
                    Analyze
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm("Delete this mass?")) {
                        deleteMutation.mutate(mass.uid)
                      }
                    }}
                  >
                    <Trash2 className="size-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function MassesList() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading masses...</div>}>
      <MassesListContent />
    </Suspense>
  )
}

function MassesIndex() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Masses</h1>
          <p className="text-muted-foreground">
            Saved mass configurations. Click one to analyze, or create a new one.
          </p>
        </div>
        <AddMassDialog />
      </div>
      <MassesList />
    </div>
  )
}
