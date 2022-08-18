import { GuiState } from "./guiState";

/** action type with saved data about an action done by a user */
export type Action = {
  timestamp: number;
  actionType: PossibleAction;
  elementId: string;
  prevState: GuiState;
  nextState: GuiState;
};

/** enum for possible user actions */
export enum PossibleAction {
  CLICK = "CLICK",
  SUBMIT = "SUBMIT",
  INPUT = "INPUT",
  ROUTE = "ROUTE",
  END_WALKTHROUGH = "END_WALKTHROUGH",
  START_WALKTHROUGH = "START_WALKTHROUGH",
}
