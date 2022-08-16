import { CSSProperties } from "react";

export type GuiState = {
  widgetArray: Widget[];
  currentRoute: string;
};

export type Widget = {
  id: string;
  route?: string;
  boundingWidth?: number;
  boundingHeight?: number;
  xpos?: number;
  ypos?: number;
  style?: CSSStyleDeclaration | undefined;
  children?: Widget[] | null;
};
