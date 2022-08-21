import { GuiState } from "./guiState";

type Walkthrough = {
  startingAction: NextAction;
  timestamp: number;
  userId?: string;
};

type NextAction = {
  guiState: GuiState;
  nextAction: NextAction;
};
