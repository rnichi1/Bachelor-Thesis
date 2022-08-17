import { useEffect, useReducer } from "react";
import deepEqual from "fast-deep-equal/es6";
import { usePrevious } from "./usePrevious";
import { ReducerState, ReducerType } from "../types/reducerTypes";

//SOURCE: https://dev.to/sgolovine/persisting-usereducer-with-a-custom-react-hook-1j27 accessed on 17.07.2022

/** Persists global state over refreshes and routing by storing it and fetching it through LocalStorage in the browser */
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
          walkthroughActive: false,
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

    /** leaves out more complicated data types like Map, which don't behave well with stringify */
    const adjustedState = {
      actions: state.actions,
      ids: [],
      guiStates: state.guiStates ? state.guiStates : [],
      walkthroughActive: state.walkthroughActive,
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
