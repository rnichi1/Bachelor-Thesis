//action type with saved data about an action done by a user
import { GuiState } from "./guiState";

export type Action = {
  timestamp: number;
  actionType: PossibleAction;
  elementId: string;
  prevState: GuiState;
  nextState: GuiState;
};

//enum for possible user actions
export enum PossibleAction {
  CLICK = "CLICK",
  SUBMIT = "SUBMIT",
  ROUTE = "ROUTE",
}
