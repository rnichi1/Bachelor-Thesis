import * as React from "react";
import {
  createElement,
  ForwardedRef,
  ReactElement,
  ReactNode,
  useCallback,
  useId,
  useMemo,
} from "react";
import { v4 as uuid } from "uuid";
import { ReducerActionEnum, ReducerState } from "../reducer/reducer";
import { action, PossibleAction } from "../types/actions";
import { IdWrapper } from "../components/Provider/IdWrapper";

export const useSubTree = () => {
  //returns a children subtree of any component as a React Element
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

      return React.Children.map(children, (element: React.ReactNode) => {
        //Check if element is an element that React can render
        if (!React.isValidElement(element)) return element;

        //If element is a Link from react-router, don't copy the element
        if (
          (element.type as unknown as { displayName: string }).displayName ===
          "Link"
        ) {
          return element;
        }

        //destructure element properties
        const { props } = element;

        const wrappedElement = createElement(
          IdWrapper as any,
          {
            ...props,
            parentId: parentId,
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
