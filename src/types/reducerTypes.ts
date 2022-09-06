import { ReducerActionEnum } from "../reducer/reducer";
import { Action } from "./actions";
import { MutableRefObject } from "react";
import { GuiState } from "./guiState";

export type ReducerState = {
  guiStates: GuiState[];
  actions: Action[];
  refs: Map<string, MutableRefObject<HTMLElement>>;
  walkthroughActive: boolean;
};

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
