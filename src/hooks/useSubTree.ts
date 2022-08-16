import * as React from "react";
import { createElement, ReactNode, useCallback, useMemo } from "react";

import { IdWrapper } from "../components/Provider/IdWrapper";
import { Widget } from "../types/guiState";
import { ActionType, ReducerState } from "../types/reducerTypes";
import { useXpath } from "./useXpath";
import { useLocation } from "react-router-dom";

/** Custom React Hook with getSubTree function, which is used to add a higher order component to each valid component and element in the react ui tree.
 */
export const useSubTree = () => {
  const { getXpathId, getXpathIndexMap } = useXpath();

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
      typeMap: Map<string | undefined, string>,
      hasLink?: boolean
    ): React.ReactNode | React.ReactNode[] => {
      /** occurrence of specific html elements inside children array (e.g. how many div elements are in the children array, how many input element, etc.) to know if brackets are needed, if it is 1 or less, the brackets are omitted in xPath. */
      let componentIndexMap = getXpathIndexMap(children, typeMap);
      //keep track of count of already found html element types to write correct index in id
      let currentIndexMap = new Map();

      return React.Children.map(children, (element: React.ReactNode, i) => {
        //Check if element is an element that React can render
        if (!React.isValidElement(element)) return element;

        //destructure element properties
        const { props } = element;

        const xpathComponentId = getXpathId(
          element,
          xpathId,
          componentIndexMap,
          currentIndexMap,
          typeMap
        );

        //skip links, as they do not work with the IdWrapper, and add to id that there is a link on the children
        if (
          (element.type as unknown as { displayName: string }).displayName ===
            "Link" ||
          (element.type as unknown as { displayName: string }).displayName ===
            "NavLink"
        ) {
          return React.cloneElement(
            element,
            { ...props },
            getSubTree(props.children, dispatch, xpathId + "/a", typeMap, true)
          );
        }

        /** wrapped element in higher order component to add needed properties to it and call getSubTree function recursively */
        const wrappedElement = createElement(
          IdWrapper as any,
          {
            ...props,
            xpathId: xpathId,
            loopIndex: i,
            xpathComponentId,
            typeMap,
            hasLink,
          },
          element
        );

        return wrappedElement;
      });
    },
    [getXpathIndexMap, getXpathId]
  );

  /** computes current gui state */
  const getCurrentGuiState = useCallback(
    (
      children: ReactNode[] | ReactNode,
      xpathId: string,
      state: ReducerState,
      typeMap: Map<string | undefined, string>,
      route?: string
    ) => {
      /** occurrence of specific html elements inside children array (e.g. how many div elements are in the children array, how many input element, etc.) to know if brackets are needed, if it is 1 or less, the brackets are omitted in xPath. */
      let componentIndexMap = getXpathIndexMap(children, typeMap);
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
          currentIndexMap,
          typeMap
        );

        let element_children = [];

        let currentRoute;

        //check for routes
        if ((type as Function).name === "Route") {
          if (props.path !== route) return;
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
          typeMap,
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
        let values;
        let styleAsObject: any = {};

        if (ref?.current?.style) values = Object.values(ref?.current?.style);

        values &&
          values.forEach((v) => {
            styleAsObject[v as any] = ref?.current?.style[v as any];
          });

        // convert an dom element into type widget and saves relevant information inside the widget object */
        const widget: Widget = {
          id: xpathComponentId,
          route: currentRoute ? currentRoute : route ? route : "route not set",
          children: computedChildrenArray ? computedChildrenArray : [],
          boundingHeight: boundingRect ? boundingRect.height : -1,
          boundingWidth: boundingRect ? boundingRect.width : -1,
          style: styleAsObject,
          xpos: boundingRect ? boundingRect.x : -1,
          ypos: boundingRect ? boundingRect.y : -1,
        };

        return widget;
      });
    },
    [getXpathIndexMap, getXpathId]
  );

  type TypeArrayType = (
    | { name: string; type: string; typeArray: TypeArrayType }
    | null
    | undefined
  )[];

  /** creates a nested array with objects, which contain the type of each functional component inside the app to be able to create xpath id's */
  const getFunctionalComponentTypes = useCallback(
    (children: ReactNode[] | ReactNode) => {
      return React.Children.map(children, (element: React.ReactNode, i) => {
        if (!React.isValidElement(element)) return;

        const { type, props } = element;

        let element_children = [];

        //check for routes
        if ((element.type as Function).name === "Route") {
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

        const childrenTypes: any =
          getFunctionalComponentTypes(element_children);

        if (typeof type === "function") {
          if (
            !((type as Function).name === "Route") &&
            !((type as Function).name === "Switch") &&
            !((type as Function).name === "Redirect") &&
            !((type as Function).name === "Redirect")
          ) {
            return {
              name: (type as Function).name,
              type: (type as Function)().type,
              childrenTypes: childrenTypes,
            };
          }
        }
        return { childrenTypes: childrenTypes };
      });
    },
    []
  );

  return useMemo(() => {
    return { getSubTree, getCurrentGuiState, getFunctionalComponentTypes };
  }, [getSubTree, getCurrentGuiState, getFunctionalComponentTypes]);
};
