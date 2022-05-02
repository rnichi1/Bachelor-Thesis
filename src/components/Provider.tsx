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

  const getSubTree = useCallback((element: React.ReactNode) => {
    if (!React.isValidElement(element)) return element;

    const { props } = element;

    return React.Children.map(props.children, (element: React.ReactNode) => {
      if (!React.isValidElement(element)) return element;
      const myRef = createRef();
      const childElement = React.createElement(
        element.type,
        { ref: myRef },
        element.props.children
      );
      console.log(childElement);
      return childElement;
    });
  }, []);

  return (
    <>
      {React.Children.map(children, (Child) => {
        return getSubTree(Child);
      })}
    </>
  );
};
