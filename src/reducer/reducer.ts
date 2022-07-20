import * as React from "react";

import { Action } from "../types/actions";
import { ReducerState } from "../types/reducerTypes";

export const initialState: ReducerState = {
  actions: [],
  ids: new Map(),
};

export enum ReducerActionEnum {
  UPDATE_ACTIONS,
  UPDATE_IDS,
}

export const reducer: (
  state: ReducerState,
  action: {
    type: ReducerActionEnum;
    newUserAction?: Action;
    newIdObject?: { id: string; element: React.ReactNode };
  }
) => ReducerState = (
  state: ReducerState,
  action: {
    type: ReducerActionEnum;
    newUserAction?: Action;
    newIdObject?: { id: string; element: React.ReactNode };
  }
) => {
  switch (action.type) {
    case ReducerActionEnum.UPDATE_ACTIONS:
      return {
        ...state,
        actions: action.newUserAction
          ? [...state.actions, action.newUserAction]
          : state.actions,
      };
    case ReducerActionEnum.UPDATE_IDS:
      const idsCopy = state.ids;
      if (!idsCopy.has(action.newIdObject?.id as string))
        idsCopy.set(
          action.newIdObject?.id as string,
          action.newIdObject?.element
        );
      return {
        ...state,
        ids: idsCopy,
      };
    default:
      return state;
  }
};
