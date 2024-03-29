import * as React from "react";
import { createElement, useCallback, useMemo } from "react";

import { HocWrapper } from "../components/Provider/hocWrapper";
import { GuiState, Widget } from "../types/guiState";
import { ActionType, ReducerState } from "../types/reducerTypes";
import { useXpath } from "./useXpath";
import { XPATH_ID_BASE } from "../components/Provider/Provider";
import { useGuiStateId } from "./useGuiStateId";

/** Custom React Hook with getSubTree function, which is used to add a higher order component to each valid component and element in the react ui tree.
 */
export const useSubTree = () => {
  const { getXpathId, getXpathIndexMap } = useXpath();
  const { getGuiStateId } = useGuiStateId();

  /**
   * returns a children subtree of any component with each component wrapped in a HOC that injects custom functionality into action functions.
   @param children the react component subtree
   @param dispatch function used for saving data to reducer
   @param parentId Id of parent component
   @param xpathId xpathId
  */
  const injectHoc = useCallback(
    (
      children: React.ReactNode | React.ReactNode[],
      dispatch: React.Dispatch<ActionType>,
      xpathId: string,
      firstXpathId?: string,
      parentRef?: React.MutableRefObject<HTMLElement>,
      hasLink?: boolean
    ): React.ReactNode | React.ReactNode[] => {
      /** occurrence of specific html elements inside children array (e.g. how many div elements are in the children array, how many input element, etc.) to know if brackets are needed, if it is 1 or less, the brackets are omitted in xPath. */
      let componentIndexMap = getXpathIndexMap(children, parentRef);
      //keep track of count of already found html element types to write correct index in id
      let currentIndexMap = new Map();

      // avoid things like contexts, since they can't be used with Children.map
      if (typeof children === "function") {
        return children;
      }

      /** counts valid elements */
      let childrenIndex = 0;

      return React.Children.map(children, (element: React.ReactNode) => {
        // Check if element is an element that React can render
        if (!React.isValidElement(element)) return element;

        // destructure element properties
        const { type } = element;

        // compute xpathId
        const xpathComponentId = getXpathId(
          element,
          xpathId,
          componentIndexMap,
          currentIndexMap,
          childrenIndex,
          parentRef
        );

        // increment index, this is handled separately because of components that are not considered valid elements and thus skew the actual type indices of xpath ids if counted.
        childrenIndex++;

        let parentId =
          firstXpathId ||
          xpathComponentId === XPATH_ID_BASE ||
          !xpathComponentId
            ? firstXpathId
            : xpathComponentId;

        /** id if it is a Link component */
        const linkAddedToId = xpathId + "/a";

        // check that hasLink is only true for Link components
        if (hasLink) {
          hasLink = false;
        }

        // mark links so that router actions are handled correctly.
        if (
          (type as any).displayName === "Link" ||
          (type as any).displayName === "NavLink"
        ) {
          hasLink = true;
        }

        /** wrapped element in higher order component to add needed properties to it and call getSubTree function recursively */
        const wrappedElement = createElement(HocWrapper, {
          children: element,
          xpathComponentId: hasLink ? linkAddedToId : xpathComponentId,
          hasLink,
          parentId,
        });

        return wrappedElement;
      });
    },
    [getXpathIndexMap, getXpathId]
  );

  /** instantiates a functional object recursively to get its first DOM element to be rendered, such that functionality can be injected. This recursive procedure is needed, because of nested functional components, which are not rendered until the first DOM element. */
  const recursivelyInstantiateFunctionalComponent: (
    functional: any
  ) => React.ReactNode | React.ReactNode[] = useCallback((functional: any) => {
    if (!React.isValidElement(functional)) return;

    const { type, props } = functional;

    if ((type as Function).name !== "Route") {
      if (!type || !(type as Function)(props)) {
        return undefined;
      }
    }

    // check for routes as they can have children inside the component or render prop. These need to be looked at as well, in order to find the type and children of the component inside the route.
    if ((type as Function).name === "Route") {
      let route_children;

      if ((functional.props as any).component) {
        route_children = (functional.props as any).component;
      } else if ((functional.props as any).render) {
        route_children = (functional.props as any).render;
      } else {
        route_children = (functional.props as any).children;
      }
      if (typeof route_children().type === "function") {
        return recursivelyInstantiateFunctionalComponent(route_children);
      } else {
        return route_children();
      }
    } else if (typeof (type as Function)(props).type === "function") {
      // recursion over all children that are functional components to find the element that will actually be rendered on screen.
      return recursivelyInstantiateFunctionalComponent(
        (type as Function)(props)
      );
    } else {
      return (type as Function)(props);
    }
  }, []);

  /** recursively looks through DOM elements, starting from a HTMLElement (provided by a ref) and gets the current GUI state */
  const getGuiState = useCallback(
    (ref: HTMLElement | undefined, currentRoute?: string) => {
      if (!ref) return null;

      /** bounding rect object of referenced element. Provides info on positioning and shape of element */
      let boundingRect;

      /** styles defined in css for example */
      let styles;
      /** styles defined in styles prop */
      let inlineStyles;
      /** custom object for styles */
      let styleAsObject: any = {};
      /** custom object for inline styles */
      let inlineStyleAsObject: any = {};
      /** xpath id of component */
      let xpathComponentId: string | null = "";
      /** children computed from the childrenNodes array of the DOM reference */
      let children: Widget[] = [];
      /** strings which are not valid react elements */
      let text: string | null = "";

      if (ref && ref.localName) {
        // get xpath id
        xpathComponentId = ref.getAttribute("xpathid");

        children = Array.from(ref.childNodes).map((child) => {
          return getGuiState(child as any);
        }) as Widget[];

        try {
          boundingRect = (ref as any).getBoundingClientRect();
        } catch (e) {
          console.log(e, "error in getting bounding rect from component", ref);
        }

        // inline styles, defined in js, need to be handled separately, because getComputedStyle does not return them. Returns a CSSStyleDeclaration object, which updates when the styles update in the DOM.
        if (ref.style && ref.style.length > 0) {
          inlineStyles = Object.values(ref.style);

          // Add the relevant styles to an object to store
          inlineStyles &&
            inlineStyles.forEach((v) => {
              inlineStyleAsObject[v as any] = ref.style[v as any];
            });
        }

        // Styles defined in CSS, getComputedStyle returns a CSSStyleDeclaration object, which updates when the styles update in the DOM.
        if (ref) {
          styles = Object.values(getComputedStyle(ref));

          // Add the relevant styles to an object to store
          styles &&
            styles.forEach((v) => {
              styleAsObject[v as any] = getComputedStyle(ref)[v as any];
            });
        }
      } else {
        // adds text elements to state so that text content changes are recorded as well
        text = ref.textContent;
      }
      let inputValue;
      if (ref.attributes?.getNamedItem("inputvalue")) {
        inputValue = ref.attributes?.getNamedItem("inputvalue")?.value;
      }

      /** creates a widget object for a DOM element and saves relevant information inside */
      const widget: Widget = {
        id: xpathComponentId,
        route: currentRoute ? currentRoute : "route not set",
        children: children,
        boundingHeight: boundingRect ? boundingRect.height : -1,
        boundingWidth: boundingRect ? boundingRect.width : -1,
        style: styleAsObject,
        inlineStyle: inlineStyleAsObject,
        xpos: boundingRect ? boundingRect.x : -1,
        ypos: boundingRect ? boundingRect.y : -1,
        text: text ? text : undefined,
        inputValue: inputValue ? inputValue : undefined,
      };
      return widget;
    },
    []
  );

  /** computes current gui state */
  const getCurrentGuiState = useCallback(
    async (xpathId: string | undefined, state: ReducerState, currentRoute) => {
      if (!xpathId)
        return { widgets: undefined, stateId: -1, currentRoute: "" };
      const ref = state.refs.get(xpathId);
      let widgets_data = getGuiState(ref?.current);
      const widgets = widgets_data ? widgets_data : undefined;
      let guiState: GuiState = {
        widgets,
        stateId: getGuiStateId(state, widgets),
        currentRoute,
      };

      return guiState;
    },
    [getGuiState, getGuiStateId]
  );

  return useMemo(() => {
    return {
      injectHoc,
      getCurrentGuiState,
      recursivelyInstantiateFunctionalComponent,
    };
  }, [
    injectHoc,
    getCurrentGuiState,
    recursivelyInstantiateFunctionalComponent,
  ]);
};
