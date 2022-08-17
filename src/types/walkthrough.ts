import { GuiState } from "./guiState";
import { Action } from "./actions";

type Walkthrough = {
  startingAction: NextAction;
  timestamp: number;
  userId?: string;
};

type NextAction = {
  guiState: GuiState;
  nextAction: NextAction;
};
