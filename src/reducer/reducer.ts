import * as React from "react";
import { Action } from "../types/actions";
import { ReducerState } from "../types/reducerTypes";
import { MutableRefObject } from "react";

export const initialState: ReducerState = {
  actions: [],
  ids: new Map(),
  refs: new Map(),
};

export enum ReducerActionEnum {
  UPDATE_ACTIONS,
  UPDATE_IDS,
  UPDATE_REFS,
}

export const reducer: (
  state: ReducerState,
  action: {
    type: ReducerActionEnum;
    newUserAction?: Action;
    newIdObject?: {
      id: string;
      element: React.ReactNode;
    };
    newRefObject?: {
      id: string;
      ref: MutableRefObject<undefined>;
    };
  }
) => ReducerState = (
  state: ReducerState,
  action: {
    type: ReducerActionEnum;
    newUserAction?: Action;
    newIdObject?: {
      id: string;
      element: React.ReactNode;
    };
    newRefObject?: {
      id: string;
      ref: MutableRefObject<undefined>;
    };
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
    case ReducerActionEnum.UPDATE_REFS:
      const refsCopy = state.refs;
      if (!refsCopy.has(action.newRefObject?.id as string))
        refsCopy.set(
          action.newRefObject?.id as string,
          action.newRefObject?.ref as MutableRefObject<undefined>
        );

      return {
        ...state,
        refs: refsCopy,
      };
    default:
      return state;
  }
};
