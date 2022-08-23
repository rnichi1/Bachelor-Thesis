import * as React from "react";
import { useCallback, useMemo } from "react";
import { useSubTree } from "./useSubTree";

export const useXpath = () => {
  const getXpathId = useCallback(
    (
      element: React.ReactElement,
      parentXpathId: string,
      typesMap: Map<string, number>,
      componentType: string
    ) => {
      const { type } = element;

      if (typeof type === "symbol") {
        return parentXpathId;
      }

      /** Xpath id for this component */
      return (
        parentXpathId +
        "/" +
        componentType +
        "[" +
        typesMap.get(componentType) +
        "]"
      );
    },
    []
  );

  return useMemo(() => {
    return { getXpathId };
  }, [getXpathId]);
};
