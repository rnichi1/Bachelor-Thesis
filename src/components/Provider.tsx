import React, {
  Children,
  createRef,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Props = {
  children: React.ReactNode | React.ReactNode[];
};

export const Provider = ({ children }: Props) => {
  const createRefs = useCallback(() => {
    const arr = React.Children.map(children, (element) => {
      const result = getChildren(element);
      return Array.isArray(result) ? [element, ...result] : result;
    });

    return arr?.map((Child) => {
      const newRef = createRef();

      return newRef;
    });
  }, []);

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
        console.log(childElement);
        return childElement;
      });
    },
    []
  );

  return <>{getSubTree(children)}</>;
};
