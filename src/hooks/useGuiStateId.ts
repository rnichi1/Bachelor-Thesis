import { useCallback, useMemo } from "react";
import { Widget } from "../types/guiState";
import { ReducerState } from "../types/reducerTypes";
import { isEqual } from "lodash";

/** Custom hook for computing a guiStateId. */
export const useGuiStateId = () => {
  /** Function that either fetches the existing id for existing states or creates a new one. */
  const getGuiStateId = useCallback(
    (state: ReducerState, widget: Widget | undefined) => {
      if (!widget) {
        return -1;
      }

      /** if GUI state is new, this ID is assigned */
      let id = state.guiStates.length + 1;

      state.guiStates.forEach((s) => {
        if (isEqual(widget, s.widgets)) {
          console.log(
            "state already exists",
            s,
            "state was not recorded and id ",
            s.stateId,
            " was returned"
          );
          id = s.stateId;
        }
      });

      if (id === state.guiStates.length + 1) {
        console.log(
          "state does not exist yet ",
          widget,
          " this new state was recorded with id ",
          state.guiStates.length + 1
        );
      }

      return id;
    },
    []
  );

  return useMemo(() => {
    return { getGuiStateId };
  }, [getGuiStateId]);
};
