import * as React from "react";
import { ReducerActionEnum } from "../reducer/reducer";
import { Action } from "./actions";
import { MutableRefObject } from "react";

export type ReducerType = (
  state: ReducerState,
  action: {
    type: ReducerActionEnum;
    newUserAction?: Action;
    newIdObject?: { id: string; element: React.ReactNode };
    newRefObject?: { id: string; ref: MutableRefObject<undefined> };
  }
) => ReducerState;

export type ReducerState = {
  actions: Action[];
  ids: Map<string, React.ReactNode>;
  refs: Map<string, MutableRefObject<undefined>>;
};
