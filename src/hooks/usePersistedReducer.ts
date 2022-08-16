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
        const { actions, ids } = JSON.parse(stringState);
        return { actions: actions, ids: new Map(ids), refs: new Map() };
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
      ids: Array.from(state.ids),
    };
    if (!stateEqual) {
      try {
        //Array to remove cyclic references, which stringify doesn't work with.
        var seen: any[] = [];
        const stringifiedState = JSON.stringify(
          adjustedState,
          function (key, val) {
            if (val != null && typeof val == "object") {
              if (seen.indexOf(val) >= 0) {
                return;
              }
              seen.push(val);
            }
            return val;
          }
        );
        localStorage.setItem(storageKey, stringifiedState);
      } catch (e) {
        console.log(e);
      }
    }
  }, [state, prevState, storageKey]);

  return { state, dispatch };
}
