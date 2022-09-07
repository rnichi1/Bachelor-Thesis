import React, { createContext } from "react";
import { ActionType, ReducerState } from "../types/reducerTypes";
import { Location } from "history";

/** Context to save GUI state data in global state
 * @param state the state from the reducer
 * @param dispatch the dispatch function from the reducer
 * @param firstParent the first parent in the hierarchy of the Provider componetn
 * @param currentRoute the current route
 * @param firstXpathId the id of the first xpath component considered in state
 * */
export const DataContext = createContext<{
  state: ReducerState;
  dispatch: React.Dispatch<ActionType>;
  firstParent: React.ReactNode | React.ReactNode[];
  currentRoute: Location<unknown>;
  firstXpathId: string;
}>({
  state: {
    actions: [],
    refs: new Map(),
    guiStates: [],
    walkthroughActive: false,
    previousWalkthroughs: [],
  },
  dispatch: () => {},
  firstParent: undefined,
  currentRoute: { pathname: "/" } as Location<unknown>,
  firstXpathId: "",
});
