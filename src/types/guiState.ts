export type GuiState = {
  widgets: Widget | undefined;
  currentRoute: string;
  stateId: number;
};

/** type used for representing the state of a widget on the screen
 * @param id a unique id in the XPath format.
 * @param route on which page the widget is rendered.
 * @param boundingWidth the actual width of the component on the screen. (not necessarily the same as the css property "width", as that might be undefined)
 * @param boundingHeight the actual height of the component on the screen. (not necessarily the same as the css property "height", as that might be undefined)
 * @param xpos the actual position of the component in the x direction on the screen.
 * @param ypos the actual position of the component in the y direction on the screen.
 * @param style all the defined css styles. (the undefined styles are not included)
 * @param children all widgets that are wrapped by this widget in the JSX tree.
 */
export type Widget = {
  id: string | null;
  route: string;
  boundingWidth: number;
  boundingHeight: number;
  xpos: number;
  ypos: number;
  style: CSSStyleDeclaration | undefined;
  inlineStyle: CSSStyleDeclaration | undefined;
  children: Widget[] | null;
};
