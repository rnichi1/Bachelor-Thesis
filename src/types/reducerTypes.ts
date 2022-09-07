import { ReducerActionEnum } from "../reducer/reducer";
import { Action } from "./actions";
import { MutableRefObject } from "react";
import { GuiState } from "./guiState";
import { Walkthrough } from "./walkthrough";

/** the type representing the global state */
export type ReducerState = {
  guiStates: GuiState[];
  actions: Action[];
  refs: Map<string, MutableRefObject<HTMLElement>>;
  walkthroughActive: boolean;
  previousWalkthroughs: Walkthrough[];
};

/** possible attributes that can be passed to the dispatch function to adjust global state */
export type ActionType = {
  type: ReducerActionEnum;
  newUserAction?: {
    action: Action;
    prevActionWasRouting?: boolean;
  };
  newRefObject?: {
    id: string;
    ref: MutableRefObject<HTMLElement>;
  };
  newGuiState?: GuiState;
};
