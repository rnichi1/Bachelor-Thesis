import { CSSProperties } from "react";

export type GuiState = {
  widgets: Widget;
};

export type Widget = {
  route: string;
  width: number;
  height: number;
  xpos: number;
  ypos: number;
  style: CSSProperties | undefined;
  children: Widget[] | null;
};
