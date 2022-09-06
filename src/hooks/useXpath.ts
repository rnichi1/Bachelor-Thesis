import * as React from "react";
import { useCallback, useMemo } from "react";
import { TypeMapValueType } from "../helpers/typeMap";
import { Widget } from "../types/guiState";

export const useXpath = () => {
  /** computes occurrence counters of specific html elements inside the children */
  const getXpathIndexMap = useCallback(
    (
      childrenArray: React.ReactNode | React.ReactNode[],
      typeMap: Map<string | undefined, TypeMapValueType>,
      parentRef?: React.MutableRefObject<HTMLElement>
    ) => {
      const ref: HTMLElement | undefined = parentRef?.current;
      let children: Element[];
      if (ref?.children) {
        children = Array.from(ref?.children);
      }

      /** map of type occurrences for building xpath indices */
      let map = new Map();

      /** counts valid elements */
      let childrenIndex = 0;
      React.Children.forEach(childrenArray, (element: React.ReactNode) => {
        if (!React.isValidElement(element)) return;

        const { type } = element;

        let fcChildrenType;

        if (
          !((type as Function).name === "Route") &&
          !((type as Function).name === "Switch") &&
          !((type as Function).name === "Redirect") &&
          children
        ) {
          /*if (typeMap)
              fcChildrenType = typeMap.get((type as Function).name)?.type;*/
          fcChildrenType = children[childrenIndex]?.localName;
        }
        childrenIndex++;

        if (fcChildrenType) {
          map.set(
            fcChildrenType,
            map.has(fcChildrenType) ? map.get(fcChildrenType) + 1 : 1
          );
        } /*else if (typeof type === "string") {
          map.set(type, map.has(type) ? map.get(type) + 1 : 1);
        }*/
      });

      return map;
    },
    []
  );

  const getXpathId = useCallback(
    (
      element: React.ReactElement,
      parentXpathId: string,
      componentIndexMap: Map<any, any>,
      currentIndexMap: Map<any, any>,
      typeMap: Map<string | undefined, TypeMapValueType>,
      childrenIndex: number,
      parentRef?: React.MutableRefObject<HTMLElement>
    ) => {
      const ref: HTMLElement | undefined = parentRef?.current;
      let children: Element[] = [];
      if (ref?.children) {
        children = Array.from(ref?.children);
      }
      const { type } = element;

      /** Type of the most outer element of a functional component */
      let fcChildrenType;

      if (
        !((type as Function).name === "Route") &&
        !((type as Function).name === "Switch") &&
        !((type as Function).name === "Redirect") &&
        children &&
        children.length > 0
      ) {
        fcChildrenType = children[childrenIndex]?.localName;
      }

      if (
        typeof type === "function" &&
        ((type as Function).name === "Redirect" ||
          (type as Function).name === "Switch" ||
          (type as Function).name === "Route")
      ) {
        return parentXpathId;
      }

      /*if (
        typeof type === "function" &&
        !(type as any).prototype?.isReactComponent &&
        !((type as Function).name === "Route") &&
        !((type as Function).name === "Switch") &&
        !((type as Function).name === "Redirect")
      ) {
        if (typeMap)
          fcChildrenType = typeMap.get((type as Function).name)?.type;
      } else if (
        typeof type === "function" &&
        ((type as Function).name === "Redirect" ||
          (type as Function).name === "Switch" ||
          (type as Function).name === "Route")
      ) {
        return parentXpathId;
      } else if (
        typeof type === "function" &&
        !!(type as any).prototype?.isReactComponent
      ) {
        return parentXpathId;
      }*/

      if (typeof type === "symbol") {
        return parentXpathId;
      }

      if (fcChildrenType) {
        currentIndexMap.set(
          fcChildrenType,
          currentIndexMap.has(fcChildrenType)
            ? currentIndexMap.get(fcChildrenType) + 1
            : 1
        );
      } /*else if (typeof type === "string") {
        currentIndexMap.set(
          type,
          currentIndexMap.has(type) ? currentIndexMap.get(type) + 1 : 1
        );
      }*/

      return fcChildrenType
        ? parentXpathId +
            "/" +
            fcChildrenType +
            (componentIndexMap.has(fcChildrenType) &&
            componentIndexMap.get(fcChildrenType) > 1
              ? "[" + currentIndexMap.get(fcChildrenType) + "]"
              : "")
        : parentXpathId;
    },
    []
  );

  return useMemo(() => {
    return { getXpathId, getXpathIndexMap };
  }, [getXpathIndexMap, getXpathId]);
};
