import * as React from "react";
import { ReactNode, useCallback, useMemo } from "react";
import { ReducerState } from "../types/reducerTypes";
import { cloneDeep } from "lodash";
import { Widget } from "../types/guiState";

export const useXpath = () => {
  /** computes occurrence counters of specific html elements inside the children */
  const getXpathIndexMap = useCallback(
    (
      childrenArray: React.ReactNode | React.ReactNode[],
      typeMap: Map<string | undefined, string>
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
            console.log(typeMap);
            if (typeMap) fcChildrenType = typeMap.get((type as Function).name);
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
    },
    []
  );

  const getXpathId = useCallback(
    (
      element: React.ReactElement,
      parentXpathId: string,
      componentIndexMap: Map<any, any>,
      currentIndexMap: Map<any, any>,
      typeMap: Map<string | undefined, string>
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
          if (typeMap) fcChildrenType = typeMap.get((type as Function).name);
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
    },
    []
  );

  return useMemo(() => {
    return { getXpathId, getXpathIndexMap };
  }, [getXpathIndexMap, getXpathId]);
};
