import { useCallback, useMemo } from "react";
import { Widget } from "../types/guiState";
import { ReducerState } from "../types/reducerTypes";
import { isEqual } from "lodash";

/** Custom hook for computing a guiStateId. */
export const useGuiStateId = () => {
  /** Function that either fetches the existing id for existing states or creates a new one. */
  const getGuiStateId = useCallback(
    (state: ReducerState, widgetArray: Widget[] | null | undefined) => {
      if (!widgetArray) {
        return -1;
      }

      let id = state.guiStates.length + 1;

      state.guiStates.forEach((s) => {
        console.log(s.widgetArray, widgetArray);
        if (isEqual(widgetArray, s.widgetArray)) {
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
          widgetArray,
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
