import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { MODES } from "@/utils/massTypes"

interface MassCalcHeaderProps {
  name: string
  description: string
  mode: string
  isValid: boolean
  isPending: boolean
  uid: string | null
  onSave: () => void
}

export function MassCalcHeader({
  name,
  description,
  mode,
  isValid,
  isPending,
  uid,
  onSave,
}: MassCalcHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <Link to="/masses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {name || "Mass Calculator"}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {MODES.find((m) => m.value === mode)?.label ?? mode.toUpperCase()}
        </Badge>
        <LoadingButton
          onClick={onSave}
          loading={isPending}
          disabled={!isValid}
          size="sm"
        >
          {uid ? "Update" : "Save"}
        </LoadingButton>
      </div>
    </div>
  )
}
