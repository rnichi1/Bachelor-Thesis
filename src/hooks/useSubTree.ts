import * as React from "react";
import { createElement, useCallback, useMemo, useState } from "react";
import { ReducerActionEnum } from "../reducer/reducer";
import { action } from "../types/actions";
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

      return React.Children.map(children, (element: React.ReactNode, i) => {
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
