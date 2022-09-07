import * as React from "react";
import { Action } from "../types/actions";
import { ActionType, ReducerState } from "../types/reducerTypes";
import { MutableRefObject } from "react";
import { GuiState } from "../types/guiState";
import { isEqual } from "lodash";

/** initial state of the reducer */
export const initialState: ReducerState = {
  actions: [],
  refs: new Map(),
  guiStates: [],
  walkthroughActive: false,
  previousWalkthroughs: [],
};

/** all the different reducer update actions that can be done to update global state. */
export enum ReducerActionEnum {
  UPDATE_ACTIONS = "UPDATE_ACTIONS",
  UPDATE_REFS = "UPDATE_REFS",
  UPDATE_GUI_STATES = "UPDATE_GUI_STATES",
  START_WALKTHROUGH = "START_WALKTHROUGH",
  END_WALKTHROUGH = "END_WALKTHROUGH",
  ADD_NEW_WALKTHROUGH = "ADD_NEW_WALKTHROUGH",
}

/** this reducer handles global state management. Actions can be dispatched with the dispatch function. */
export const reducer: (
  state: ReducerState,
  action: ActionType
) => ReducerState = (state: ReducerState, action: ActionType) => {
  switch (action.type) {
    case ReducerActionEnum.UPDATE_ACTIONS:
      // check if previous action was routing to change the state of the routing action. This is required because during the routing, the refs are not available of the page that is loading. Since the last action is ending the recording, this is safe to do.
      if (action.newUserAction?.prevActionWasRouting) {
        const stateActionsCopy = [...state.actions];
        stateActionsCopy[stateActionsCopy.length - 1].nextState =
          action.newUserAction.action.nextState;
        stateActionsCopy[stateActionsCopy.length - 1].nextStateId =
          action.newUserAction.action.nextStateId;

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

    case ReducerActionEnum.UPDATE_REFS:
      const refsCopy = state.refs;
      if (action.newRefObject?.id && action.newRefObject?.ref.current)
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
            isEqual(action.newGuiState.widgets, state.guiStates[i].widgets) &&
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

    case ReducerActionEnum.ADD_NEW_WALKTHROUGH:
      const walkthroughsCopy = state.previousWalkthroughs
        ? [...state.previousWalkthroughs]
        : [];

      const withoutPropagatedActions = state.actions.filter((action) => {
        return !action.wasPropagated;
      });

      if (state.actions) {
        walkthroughsCopy.push({
          withPropagatedActions: state.actions,
          withoutPropagatedActions,
          timestamp: new Date().getTime(),
        });
      }

      return { ...state, previousWalkthroughs: walkthroughsCopy, actions: [] };

    case ReducerActionEnum.START_WALKTHROUGH:
      return { ...state, walkthroughActive: true };
    case ReducerActionEnum.END_WALKTHROUGH:
      return { ...state, walkthroughActive: false };

    default:
      return state;
  }
};
