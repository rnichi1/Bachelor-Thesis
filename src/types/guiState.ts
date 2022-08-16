import { CSSProperties } from "react";

export type GuiState = {
  widgetArray: Widget[];
};

export type Widget = {
  id: string;
  route?: string;
  width?: number;
  height?: number;
  xpos?: number;
  ypos?: number;
  style?: CSSStyleDeclaration | undefined;
  children?: Widget[] | null;
};
