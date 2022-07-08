//action type with saved data about an action done by a user
export type action = {
  timestamp: number;
  actionName: PossibleAction;
};

//enum for possible action for a user
export enum PossibleAction {
  CLICK,
  SUBMIT,
  TYPE,
}
