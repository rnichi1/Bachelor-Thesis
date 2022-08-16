//action type with saved data about an action done by a user
export type Action = {
  timestamp: number;
  actionType: PossibleAction;
  elementId: string;
};

//enum for possible user actions
export enum PossibleAction {
  CLICK = "CLICK",
  SUBMIT = "SUBMIT",
  ROUTE = "ROUTE",
}
