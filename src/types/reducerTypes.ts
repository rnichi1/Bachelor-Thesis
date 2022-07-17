import * as React from "react";
import { ReducerActionEnum } from "../reducer/reducer";
import { action } from "./actions";

export type ReducerType = (
  state: ReducerState,
  action: {
    type: ReducerActionEnum;
    newUserAction?: action;
    newIdObject?: { id: string; element: React.ReactNode };
  }
) => ReducerState;

export type ReducerState = {
  actions: action[];
  ids: Map<string, React.ReactNode>;
};
