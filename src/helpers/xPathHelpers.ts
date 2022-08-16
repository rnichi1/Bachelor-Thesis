import * as React from "react";
import { ReactNode } from "react";
import { ReducerState } from "../types/reducerTypes";
import { cloneDeep } from "lodash";
import { Widget } from "../types/guiState";

/** computes occurrence counters of specific html elements inside the children */
export const getXpathIndexMap = (
  childrenArray: React.ReactNode | React.ReactNode[]
) => {
  let map = new Map();
  React.Children.forEach(childrenArray, (element: React.ReactNode) => {
    if (!React.isValidElement(element)) return;

    const { type } = element;

    let fcChildrenType;

    if (typeof type === "function") {
      if (
        !((type as Function).name === "Route") &&
        !((type as Function).name === "Switch") &&
        !((type as Function).name === "Redirect") &&
        !((type as Function).name === "Redirect")
      ) {
        fcChildrenType = (type as Function)().type;
      }
    }

    if (fcChildrenType) {
      map.set(
        fcChildrenType,
        map.has(fcChildrenType) ? map.get(fcChildrenType) + 1 : 1
      );
    } else if (typeof type === "string") {
      map.set(type, map.has(type) ? map.get(type) + 1 : 1);
    }
  });

  return map;
};

export const getXpathId = (
  element: React.ReactElement,
  parentXpathId: string,
  componentIndexMap: Map<any, any>,
  currentIndexMap: Map<any, any>
) => {
  const { type } = element;

  /** Type of the most outer element of a functional component */
  let fcChildrenType;

  if (typeof type === "function") {
    if (
      !((type as Function).name === "Route") &&
      !((type as Function).name === "Switch") &&
      !((type as Function).name === "Redirect")
    ) {
      fcChildrenType = (type as Function)().type;
    } else {
      return parentXpathId;
    }
  }

  if (fcChildrenType) {
    currentIndexMap.set(
      fcChildrenType,
      currentIndexMap.has(fcChildrenType)
        ? currentIndexMap.get(fcChildrenType) + 1
        : 1
    );
  } else if (typeof type === "string") {
    currentIndexMap.set(
      type,
      currentIndexMap.has(type) ? currentIndexMap.get(type) + 1 : 1
    );
  }

  /** Xpath id for this component */
  return fcChildrenType
    ? parentXpathId +
        "/" +
        fcChildrenType +
        (componentIndexMap.has(fcChildrenType) &&
        componentIndexMap.get(fcChildrenType) > 1
          ? "[" + currentIndexMap.get(fcChildrenType) + "]"
          : "")
    : parentXpathId +
        "/" +
        type +
        (componentIndexMap.has(type) && componentIndexMap.get(type) > 1
          ? "[" + currentIndexMap.get(type) + "]"
          : "");
};

/** computes current gui state */
export const getCurrentGuiState = (
  children: ReactNode[] | ReactNode,
  xpathId: string,
  state: ReducerState,
  route?: string
) => {
  /** occurrence of specific html elements inside children array (e.g. how many div elements are in the children array, how many input element, etc.) to know if brackets are needed, if it is 1 or less, the brackets are omitted in xPath. */
  let componentIndexMap = getXpathIndexMap(children);
  //keep track of count of already found html element types to write correct index in id
  let currentIndexMap = new Map();

  return React.Children.map(children, (element: React.ReactNode, i) => {
    if (!React.isValidElement(element)) return;

    const { props, type } = element;

    let xpathComponentId = "";

    // compute Xpath Id
    xpathComponentId = getXpathId(
      element,
      xpathId,
      componentIndexMap,
      currentIndexMap
    );

    let element_children = [];

    let currentRoute;

    //check for routes
    if ((type as Function).name === "Route") {
      currentRoute = props.path;
      if (element.props.component) {
        element_children = props.component().props.children;
      } else if (element.props.render) {
        element_children = props.render().props.children;
      } else {
        element_children = props.children;
      }
    } else {
      element_children = props.children;
    }
    /** recursively computed widget tree */
    let computedChildrenArray;

    //skip links, and add to id that there is a link on the children
    if (
      (element.type as unknown as { displayName: string }).displayName ===
        "Link" ||
      (element.type as unknown as { displayName: string }).displayName ===
        "NavLink"
    ) {
      xpathComponentId = xpathId + "/a";
    }

    computedChildrenArray = getCurrentGuiState(
      element_children,
      xpathComponentId,
      state,
      currentRoute ? currentRoute : route
    );

    // get the reference from the global storage
    const ref = state.refs.get(xpathComponentId);

    /** bounding rect object of referenced element. Provides info on positioning and shape of element */
    let boundingRect;

    if (ref && ref.current) {
      try {
        boundingRect = (ref.current as any).getBoundingClientRect();
        console.log("got new bounding rect");
      } catch (e) {
        console.log(
          e,
          "error in getting bounding rect from component",
          ref.current
        );
      }
    }

    const styleObject = cloneDeep(ref?.current?.style);

    // convert an dom element into type widget and saves relevant information inside the widget object */
    const widget: Widget = {
      id: xpathComponentId,
      route: currentRoute ? currentRoute : route,
      children: computedChildrenArray,
      height: boundingRect?.height,
      width: boundingRect?.width,
      style: ref?.current?.style,
      xpos: boundingRect?.x,
      ypos: boundingRect?.y,
    };

    return widget;
  });
};
