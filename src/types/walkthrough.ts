import { Action } from "./actions";

export type Walkthrough = {
  withPropagatedActions: Action[];
  withoutPropagatedActions: Action[];
  timestamp: number;
};
