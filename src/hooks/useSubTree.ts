import * as React from "react";
import { createElement, useCallback, useMemo } from "react";
import { ReducerActionEnum } from "../reducer/reducer";
import { action } from "../types/actions";
import { IdWrapper } from "../components/Provider/IdWrapper";

//Custom React Hook with getSubTree function, which is use to add higher order component to each valid component and element in the react ui tree.
export const useSubTree = () => {
  //returns a children subtree of any component as a React Node with custom props to collect user action data
  const getSubTree = useCallback(
    (
      children: React.ReactNode | React.ReactNode[],
      dispatch: React.Dispatch<{
        type: ReducerActionEnum;
        newUserAction?: action | undefined;
        newIdObject?: { id: string; element: React.ReactNode } | undefined;
      }>,
      parentId: string
    ): React.ReactNode | React.ReactNode[] => {
      //define clone function

      return React.Children.map(children, (element: React.ReactNode, i) => {
        //Check if element is an element that React can render
        if (!React.isValidElement(element)) return element;

        //destructure element properties
        const { props } = element;

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
              parentId + "-link_to_" + props.to
            )
          );
        }

        //wrap element in higher order component to add needed properties to it and call getSubTree function recursively
        const wrappedElement = createElement(
          IdWrapper as any,
          {
            ...props,
            parentId: parentId,
            loopIndex: i,
          },
          element
        );

        return wrappedElement;
      });
    },
    []
  );

  return useMemo(() => {
    return { getSubTree };
  }, [getSubTree]);
};
