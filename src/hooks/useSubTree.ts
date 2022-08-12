import * as React from "react";
import { createElement, ReactNode, useCallback, useMemo } from "react";
import { ReducerActionEnum } from "../reducer/reducer";
import { Action } from "../types/actions";
import { IdWrapper } from "../components/Provider/IdWrapper";
import { Widget } from "../types/guiState";

/** Custom React Hook with getSubTree function, which is used to add a higher order component to each valid component and element in the react ui tree.
 */
export const useSubTree = () => {
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
      dispatch: React.Dispatch<{
        type: ReducerActionEnum;
        newUserAction?: Action | undefined;
        newIdObject?: { id: string; element: React.ReactNode } | undefined;
      }>,
      parentId: string,
      xpathId: string
    ): React.ReactNode | React.ReactNode[] => {
      //define clone function

      /** occurrence of specific html elements inside children array (e.g. how many div elements are in the children array, how many input element, etc.) to know if brackets are needed, if it is 1 or less, the brackets are omitted in xPath. */
      let componentIndexMap = getXpathIndexMap(children);
      //keep track of count of already found html element types to write correct index in id
      let currentIndexMap = new Map();

      return React.Children.map(children, (element: React.ReactNode, i) => {
        //Check if element is an element that React can render
        if (!React.isValidElement(element)) return element;

        //destructure element properties
        const { props, type } = element;

        /** Type of the most outer element of a functional component */
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
        let xpathComponentId = fcChildrenType
          ? xpathId +
            "/" +
            fcChildrenType +
            (componentIndexMap.has(fcChildrenType) &&
            componentIndexMap.get(fcChildrenType) > 1
              ? "[" + currentIndexMap.get(fcChildrenType) + "]"
              : "")
          : xpathId +
            "/" +
            type +
            (componentIndexMap.has(type) && componentIndexMap.get(type) > 1
              ? "[" + currentIndexMap.get(type) + "]"
              : "");

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
            getSubTree(
              props.children,
              dispatch,
              parentId + "-link_to_" + props.to,
              xpathId + "/a"
            )
          );
        }

        //wrap element in higher order component to add needed properties to it and call getSubTree function recursively
        const wrappedElement = createElement(
          IdWrapper as any,
          {
            ...props,
            parentId: parentId,
            xpathId: xpathId,
            loopIndex: i,
            xpathComponentId,
          },
          element
        );

        return wrappedElement;
      });

      //computes occurrence counters of specific html elements inside the children
      function getXpathIndexMap(
        childrenArray: React.ReactNode | React.ReactNode[]
      ) {
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
      }
    },
    []
  );

  /** computes current gui state */
  const getCurrentGuiState = useCallback((element: ReactNode[] | ReactNode) => {
    if (!React.isValidElement(element)) return;

    const { props } = element;

    const computedChildrenArray: Widget[] = [];

    //recursively compute widget tree
    React.Children.forEach(props.children, (child: React.ReactNode) => {
      const childWidget = getCurrentGuiState(child);
      if (childWidget) computedChildrenArray.push(childWidget);
    });
    /** converts an element into type widget and saves relevant information inside the widget object */
    const convertElementToWidget = (
      element: ReactNode[] | ReactNode,
      currentRoute: string
    ) => {
      if (!React.isValidElement(element)) return;
      const widget: Widget = {
        route: currentRoute,
        children: null,
        height: 0,
        width: 0,
        style: {},
        xpos: 0,
        ypos: 0,
      };
      return widget;
    };

    return convertElementToWidget(element, "/");
  }, []);

  return useMemo(() => {
    return { getSubTree, getCurrentGuiState };
  }, [getSubTree, getCurrentGuiState]);
};
