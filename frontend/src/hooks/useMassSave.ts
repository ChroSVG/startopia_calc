import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { MassModel } from "@/client"
import { MassesService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import type { CalcState } from "@/utils/massTypes"
import {
  calcStateToPayload,
  massToCalcState,
  resetTempIdCounter,
} from "@/utils/massTypes"

export function useMassSave(
  state: CalcState,
  onCreated?: (uid: string) => void,
) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = calcStateToPayload(state)
      if (state.uid) {
        return MassesService.updateMass({
          massUid: state.uid,
          requestBody: payload,
        })
      }
      return MassesService.createMass({ requestBody: payload })
    },
    onSuccess: (data) => {
      showSuccessToast(state.uid ? "Mass updated" : "Mass saved")
      queryClient.invalidateQueries({ queryKey: ["masses"] })
      if (!state.uid) {
        const saved = data as MassModel
        resetTempIdCounter()
        massToCalcState(saved)
        onCreated?.(saved.uid)
      }
    },
    onError: handleError.bind(showErrorToast),
  })

  return { saveMutation }
}
