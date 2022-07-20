import * as React from "react";
import { ReducerActionEnum } from "../reducer/reducer";
import { Action } from "./actions";

export type ReducerType = (
  state: ReducerState,
  action: {
    type: ReducerActionEnum;
    newUserAction?: Action;
    newIdObject?: { id: string; element: React.ReactNode };
  }
) => ReducerState;

export type ReducerState = {
  actions: Action[];
  ids: Map<string, React.ReactNode>;
};
