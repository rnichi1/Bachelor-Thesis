import * as React from "react";
import { createElement, ReactNode, useCallback, useMemo } from "react";

import { HocWrapper } from "../components/Provider/hocWrapper";
import { GuiState, Widget } from "../types/guiState";
import { ActionType, ReducerState } from "../types/reducerTypes";
import { useXpath } from "./useXpath";
import { TypeMapValueType } from "../helpers/typeMap";
import { XPATH_ID_BASE } from "../components/Provider/Provider";
import { useGuiStateId } from "./useGuiStateId";

/** Custom React Hook with getSubTree function, which is used to add a higher order component to each valid component and element in the react ui tree.
 */
export const useSubTree = () => {
  const { getXpathId, getXpathIndexMap } = useXpath();
  const { getGuiStateId } = useGuiStateId();

  /**
   * returns a children subtree of any component as a React Node with custom props to collect user action data.
   @param children the react component subtree
   @param dispatch function used for saving data to reducer
   @param parentId Id of parent component
   @param xpathId xpathId
  */
  const getSubTree = useCallback(
    (
      children: React.ReactNode | React.ReactNode[],
      dispatch: React.Dispatch<ActionType>,
      xpathId: string,
      typeMap: Map<string | undefined, TypeMapValueType>,
      firstXpathId?: string,
      parentRef?: React.MutableRefObject<HTMLElement>,
      hasLink?: boolean
    ): React.ReactNode | React.ReactNode[] => {
      /** occurrence of specific html elements inside children array (e.g. how many div elements are in the children array, how many input element, etc.) to know if brackets are needed, if it is 1 or less, the brackets are omitted in xPath. */
      let componentIndexMap = getXpathIndexMap(children, typeMap, parentRef);
      //keep track of count of already found html element types to write correct index in id
      let currentIndexMap = new Map();

      // avoid things like contexts, since they can't be used with Children.map
      if (typeof children === "function") {
        return children;
      }

      return React.Children.map(children, (element: React.ReactNode, i) => {
        //Check if element is an element that React can render
        if (!React.isValidElement(element)) return element;

        //destructure element properties
        const { props, type } = element;

        const xpathComponentId = getXpathId(
          element,
          xpathId,
          componentIndexMap,
          currentIndexMap,
          typeMap
        );

        let parentId =
          firstXpathId || xpathComponentId === XPATH_ID_BASE
            ? firstXpathId
            : xpathComponentId;

        const linkAddedToId = xpathId + "/a";

        //skip links, as they do not work with the HocWrapper, and add to id that there is a link on the children
        if (
          (type as any).displayName === "Link" ||
          (type as any).displayName === "NavLink"
        ) {
          /*return React.cloneElement(
            element,
            { ...props },
            getSubTree(
              props.children,
              dispatch,
              xpathId + "/a",
              typeMap,
              parentId,
              true
            )
          );*/
          //return element;
          hasLink = true;
        }

        /** wrapped element in higher order component to add needed properties to it and call getSubTree function recursively */
        const wrappedElement = createElement(HocWrapper, {
          children: element,
          xpathComponentId: hasLink ? linkAddedToId : xpathComponentId,
          typeMap,
          hasLink,
          parentId,
        });

        return wrappedElement;
      });
    },
    [getXpathIndexMap, getXpathId]
  );

  const recursivelyInstantiateFunctionalComponent: (
    functional: any
  ) => React.ReactNode | React.ReactNode[] = useCallback((functional: any) => {
    if (!React.isValidElement(functional)) return;

    const { type, props } = functional;

    if ((type as Function).name !== "Route") {
      if (!type || !(type as Function)(props)) {
        console.log(
          "for fuctional var",
          functional,
          "and type",
          type,
          " the functional was undefined when instantiated"
        );
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
      let styleAsObject: any = {};
      let inlineStyleAsObject: any = {};
      let xpathComponentId: string | null = "";
      let children: Widget[] = [];

      if (ref && ref.localName) {
        // get xpath id
        xpathComponentId = ref.getAttribute("xpathid");

        children = Array.from(ref.children).map((child) => {
          return getGuiState(child as any);
        }) as Widget[];

        try {
          boundingRect = (ref as any).getBoundingClientRect();
        } catch (e) {
          console.log(e, "error in getting bounding rect from component", ref);
        }

        // inline styles, defined in js, need to be handled separately, because getComputedStyle does not return them. Returns a CSSStyleDeclaration object, which updates when the styles update.
        if (ref.style && ref.style.length > 0) {
          inlineStyles = Object.values(ref.style);

          // Add the relevant styles to an object to store
          inlineStyles &&
            inlineStyles.forEach((v) => {
              inlineStyleAsObject[v as any] = ref.style[v as any];
            });
        }

        // Styles defined in CSS, getComputedStyle returns a CSSStyleDeclaration object, which updates when the styles update.
        if (ref) {
          styles = Object.values(getComputedStyle(ref));

          // Add the relevant styles to an object to store
          styles &&
            styles.forEach((v) => {
              styleAsObject[v as any] = getComputedStyle(ref)[v as any];
            });
        }
      }

      // creates a widget object for a DOM element and saves relevant information inside */
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
      };
      return widget;
    },
    []
  );

  /** computes current gui state */
  const getCurrentGuiState = useCallback(
    (xpathId: string | undefined, state: ReducerState, currentRoute) => {
      console.log(
        "getting current gui state with xpathId",
        xpathId,
        currentRoute
      );
      if (!xpathId)
        return { widgets: undefined, stateId: -1, currentRoute: "" };
      const ref = state.refs.get(xpathId);
      console.log(ref);
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

  /** creates a nested array with objects, which contain the type of each functional component inside the app to be able to create xpath id's. Important to note is that
   * functional components don't have a children object if it is not specifically defined in the props, thus the functional parameter is used to find nested functional components' type recursively.
   * */
  const getFunctionalComponentTypes = useCallback(
    ({ children }: { children?: ReactNode[] | ReactNode }) => {
      return React.Children.map(children, (element: React.ReactNode, i) => {
        if (!React.isValidElement(element)) return;

        const { type, props } = element;

        let element_children = props.children;
        let route_name;

        //check for routes
        if ((element.type as Function).name === "Route" && !props.children) {
          if (element.props.component) {
            route_name = props.component.name;
          } else if (element.props.render.name) {
            route_name = props.render;
          }
        }

        if (
          typeof type === "function" &&
          !element_children &&
          !((type as Function).name === "Switch") &&
          !((type as Function).name === "Redirect")
        ) {
          element_children = [
            recursivelyInstantiateFunctionalComponent(element),
          ];
        }

        let childrenTypes: any = getFunctionalComponentTypes({
          children: element_children,
        });

        if (typeof type === "function") {
          if (
            !((type as Function).name === "Route") &&
            !((type as Function).name === "Switch") &&
            !((type as Function).name === "Redirect")
          ) {
            return {
              name: (type as Function).name,
              type: element_children[0]?.type,
              childrenTypes: childrenTypes,
              children: element_children,
            };
          } else if ((type as Function).name === "Route") {
            return {
              name: route_name,
              type: element_children[0]?.type,
              childrenTypes: childrenTypes,
              children: element_children,
            };
          }
        }
        return { childrenTypes: childrenTypes };
      });
    },
    [recursivelyInstantiateFunctionalComponent]
  );

  return useMemo(() => {
    return {
      getSubTree,
      getCurrentGuiState,
      getFunctionalComponentTypes,
      recursivelyInstantiateFunctionalComponent,
    };
  }, [
    getSubTree,
    getCurrentGuiState,
    getFunctionalComponentTypes,
    recursivelyInstantiateFunctionalComponent,
  ]);
};
