import { useCallback, useMemo } from "react";
import { GuiState, Widget } from "../types/guiState";
import { ReducerState } from "../types/reducerTypes";
import { isEqual } from "lodash";

/** Custom hook for computing a guiStateId. */
export const useGuiStateId = () => {
  /** Function that either fetches the existing id for existing states or creates a new one. */
  const getGuiStateId = useCallback(
    (
      state: ReducerState,
      widgetArray: Widget[] | null | undefined,
      currentRoute: string
    ) => {
      if (!widgetArray) {
        return -1;
      }
      console.log(state);

      state.guiStates.forEach((s) => {
        if (
          isEqual(widgetArray, s.widgetArray) &&
          currentRoute === s.currentRoute
        ) {
          return s.stateId;
        }
      });

      return state.guiStates.length + 1;
    },
    []
  );

  return useMemo(() => {
    return { getGuiStateId };
  }, [getGuiStateId]);
};
