import { GuiState } from "./guiState";

/** action type with saved data about an action done by a user.
 * @param actionType this is the type of action the user performed.
 * @param wasPropagated this indicates if the action was executed through a propagation of events or if the user did the action.
 * @param elementId this is the id of the element the action was performed on.
 * @param prevState GUI state recorded before the action
 * @param nextState GUI state recorded after the action
 * @param timestamp exact timestamp in unix format
 * */
export type Action = {
  actionType: PossibleAction;
  wasPropagated: boolean;
  elementId: string;
  prevStateId: number;
  currentGuiStateId: number;
  prevState: GuiState;
  nextState: GuiState;
  timestamp: number;
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
