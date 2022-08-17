import * as React from "react";
import { ReducerActionEnum } from "../reducer/reducer";
import { Action } from "./actions";
import { MutableRefObject } from "react";
import { GuiState } from "./guiState";

export type ReducerType = (
  state: ReducerState,
  action: ActionType
) => ReducerState;

export type ReducerState = {
  guiStates: GuiState[];
  actions: Action[];
  ids: Map<string, React.ReactNode>;
  refs: Map<string, MutableRefObject<HTMLElement>>;
};

export type ActionType = {
  type: ReducerActionEnum;
  newUserAction?: { action: Action; prevActionWasRouting?: boolean };
  newIdObject?: { id: string; element: React.ReactNode };
  newRefObject?: {
    id: string;
    ref: MutableRefObject<HTMLElement>;
  };
  newGuiState?: GuiState;
};
