import * as React from "react";
import { createRef, ReactNode, useCallback, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { v4 as uuid } from "uuid";

export const useSubTree = () => {
  let ids = useMemo(() => {
    return new Map();
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

  //returns a children subtree of any component as a React Element
  const getSubTree = useCallback(
    (
      children: React.ReactNode | React.ReactNode[]
    ): React.ReactNode | React.ReactNode[] => {
      return React.Children.map(children, (element: React.ReactNode) => {
        if (!React.isValidElement(element)) return element;

        const { props, type } = element;
        let childElement: React.ReactNode;

        const myId = uuid();
        if (!ids.has(props)) ids.set(element, myId);

        function handleSubmit(e: any) {
          if (props.onSubmit) props.onSubmit(e);
          console.log("You clicked submit for the injected function.");
        }

        const ref = createRef();

        childElement = React.cloneElement(
          element,
          element.type === "form"
            ? {
                ...props,
                onSubmit: handleSubmit,
                uuid: myId,
                ref: ref,
              }
            : {
                ...props,
                ref: ref,
                onClick: (e: any) => {
                  console.log(
                    "the ",
                    element.type,
                    " with id ",
                    myId,
                    " was clicked on ",
                    new Date()
                  );
                  if (props.onClick) {
                    props.onClick(e);
                  }
                  console.log(e);
                },

                uuid: myId,
              },
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

        if (typeof type === "function") {
          if (childElement.props.children) {
            console.log(
              "first child in dom",
              ReactDOM.findDOMNode(childElement.props.children[0].ref.current)
            );
          }
        }

        console.log(childElement);
        return childElement;
      });
    },
    [ids]
  );
  return useMemo(() => {
    return { getSubTree, getChildren, ids };
  }, [getSubTree, ids, getChildren]);
};
