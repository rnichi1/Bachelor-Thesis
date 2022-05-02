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

  console.log(createRefs());

  const childArr = useMemo(() => {
    console.log(
      React.Children.map(children, (element) => {
        const result = getChildren(element);
        return Array.isArray(result) ? [element, ...result] : result;
      })
    );
    return React.Children.map(children, (element) => {
      const result = getChildren(element);
      return Array.isArray(result) ? [element, ...result] : result;
    });
  }, []);

  return <>{children}</>;
};
