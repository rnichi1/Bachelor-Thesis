import * as React from "react";
import { Children, createRef, ReactNode, useCallback, useMemo } from "react";

//WIP
export const useVisualizeComponentTree = () => {
  const visualize = useCallback(
    (children: React.ReactNode | React.ReactNode[], depth: number = 0) => {
      Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const { props } = child;

        console.log(props.children);
      });
    },
    []
  );
  return useMemo(() => {
    return { visualize };
  }, [visualize]);
};
