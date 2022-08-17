import { useEffect, useReducer } from "react";
import deepEqual from "fast-deep-equal/es6";
import { usePrevious } from "./usePrevious";
import { ReducerState, ReducerType } from "../types/reducerTypes";

export function usePersistedReducer(
  reducer: ReducerType,
  initialState: ReducerState,
  storageKey: string
) {
  const [state, dispatch] = useReducer(reducer, initialState, init);
  const prevState = usePrevious(state);

  function init(): ReducerState {
    const stringState = localStorage.getItem(storageKey);

    if (stringState) {
      try {
        const { actions, ids, guiStates } = JSON.parse(stringState);
        return {
          actions: actions,
          ids: new Map(ids),
          refs: new Map(),
          guiStates: guiStates,
        };
      } catch (error) {
        return initialState;
      }
    } else {
      return initialState;
    }
  }

  useEffect(() => {
    const stateEqual = deepEqual(prevState, state);

    /** adjust state, such that more complicated data types like Map can be saved and reconstructed from localStorage */
    const adjustedState = {
      actions: state.actions,
      ids: [],
      guiStates: state.guiStates ? state.guiStates : [],
    };
    if (!stateEqual) {
      try {
        //Array to remove cyclic references, which stringify doesn't work with.
        var seen: any[] = [];
        const stringifiedState = JSON.stringify(adjustedState);
        localStorage.setItem(storageKey, stringifiedState);
      } catch (e) {
        console.log(e);
      }
    }
  }, [state, prevState, storageKey]);

  return { state, dispatch };
}
