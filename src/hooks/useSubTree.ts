import * as React from "react";
import { createRef, ReactNode, useCallback, useMemo } from "react";

export const useSubTree = () => {
  const createRefs = useCallback(
    (children: React.ReactNode | React.ReactNode[]) => {
      const arr = React.Children.map(children, (element) => {
        const result = getChildren(element);
        return Array.isArray(result) ? [element, ...result] : result;
      });

      return arr?.map((Child) => {
        const newRef = createRef();

        return newRef;
      });
    },
    []
  );

  const getChildren = useCallback((element: React.ReactNode) => {
    if (!React.isValidElement(element)) return element;

    const { props } = element;

    return React.Children.map(props.children, (element) => {
      const grandChildren: (ReactNode | ReactNode[])[] = getChildren(element);

      return Array.isArray(grandChildren)
        ? [element, ...grandChildren]
        : grandChildren;
    });
  }, []);

  const getSubTree = useCallback(
    (
      children: React.ReactNode | React.ReactNode[]
    ): React.ReactNode | React.ReactNode[] => {
      return React.Children.map(children, (element: React.ReactNode) => {
        if (!React.isValidElement(element)) return element;

        const { props } = element;

        const myRef = createRef();

        const childElement: React.ReactNode = React.createElement(
          element.type,
          { ref: myRef },
          React.Children.map(
            props.children,
            (
              grandchild:
                | string
                | number
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | React.ReactFragment
                | React.ReactPortal
                | null
                | undefined
            ) => {
              return getSubTree(grandchild);
            }
          )
        );
        return childElement;
      });
    },
    []
  );
  return useMemo(() => {
    return { getSubTree, getChildren, createRefs };
  }, [getSubTree]);
};