import * as React from "react";
import { Action } from "../types/actions";
import { ReducerState } from "../types/reducerTypes";
import { MutableRefObject } from "react";
import { GuiState } from "../types/guiState";
import { isEqual } from "lodash";
import { act } from "react-dom/test-utils";

export const initialState: ReducerState = {
  actions: [],
  ids: new Map(),
  refs: new Map(),
  guiStates: [],
};

export enum ReducerActionEnum {
  UPDATE_ACTIONS,
  UPDATE_IDS,
  UPDATE_REFS,
  UPDATE_GUI_STATES,
}

export const reducer: (
  state: ReducerState,
  action: {
    type: ReducerActionEnum;
    newUserAction?: { action: Action; prevActionWasRouting?: boolean };
    newIdObject?: {
      id: string;
      element: React.ReactNode;
    };
    newRefObject?: {
      id: string;
      ref: MutableRefObject<HTMLElement>;
    };
  }
) => ReducerState = (
  state: ReducerState,
  action: {
    type: ReducerActionEnum;
    newUserAction?: { action: Action; prevActionWasRouting?: boolean };
    newIdObject?: {
      id: string;
      element: React.ReactNode;
    };
    newRefObject?: {
      id: string;
      ref: MutableRefObject<HTMLElement>;
    };
    newGuiState?: GuiState;
  }
) => {
  switch (action.type) {
    case ReducerActionEnum.UPDATE_ACTIONS:
      if (action.newUserAction?.prevActionWasRouting) {
        const stateActionsCopy = [...state.actions];
        stateActionsCopy[stateActionsCopy.length - 1].nextState =
          action.newUserAction.action.nextState;
        console.log(
          "since we routed before, nextState was changed to: ",
          action.newUserAction.action.nextState
        );
        console.log(stateActionsCopy[stateActionsCopy.length - 1]);
        return {
          ...state,
          actions: action.newUserAction?.action
            ? [...stateActionsCopy, action.newUserAction.action]
            : state.actions,
        };
      }
      return {
        ...state,
        actions: action.newUserAction?.action
          ? [...state.actions, action.newUserAction.action]
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
          action.newRefObject?.ref as MutableRefObject<HTMLElement>
        );

      return {
        ...state,
        refs: refsCopy,
      };

    case ReducerActionEnum.UPDATE_GUI_STATES:
      const guiStatesCopy = state.guiStates ? [...state.guiStates] : [];

      if (action.newGuiState) {
        let isNewState = true;
        for (let i = 0; i < guiStatesCopy.length; i++) {
          if (
            isEqual(
              action.newGuiState.widgetArray,
              state.guiStates[i].widgetArray
            ) &&
            action.newGuiState.currentRoute === state.guiStates[i].currentRoute
          ) {
            isNewState = false;
          }
        }

        isNewState && guiStatesCopy.push(action.newGuiState);
      }

      return {
        ...state,
        guiStates: guiStatesCopy,
      };
    default:
      return state;
  }
};
