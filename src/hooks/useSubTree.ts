import * as React from "react";
import { createElement, ReactNode, useCallback, useMemo } from "react";
import { ReducerActionEnum } from "../reducer/reducer";
import { Action } from "../types/actions";
import { IdWrapper } from "../components/Provider/IdWrapper";
import { Widget } from "../types/guiState";
import { ActionType, ReducerState } from "../types/reducerTypes";
import { cloneDeep } from "lodash";
import { getXpathId, getXpathIndexMap } from "../helpers/xPathHelpers";

/** Custom React Hook with getSubTree function, which is used to add a higher order component to each valid component and element in the react ui tree.
 */
export const useSubTree = () => {
  /**
   * returns a children subtree of any component as a React Node with custom props to collect user action data.
   @param children the react component subtree
   @param dispatch function used for saving data to reducer
   @param parentId Id of parent component
   @param xpathId xpathId
  */
  const getSubTree = useCallback(
    (
      children: React.ReactNode | React.ReactNode[],
      dispatch: React.Dispatch<ActionType>,
      xpathId: string
    ): React.ReactNode | React.ReactNode[] => {
      /** occurrence of specific html elements inside children array (e.g. how many div elements are in the children array, how many input element, etc.) to know if brackets are needed, if it is 1 or less, the brackets are omitted in xPath. */
      let componentIndexMap = getXpathIndexMap(children);
      //keep track of count of already found html element types to write correct index in id
      let currentIndexMap = new Map();

      return React.Children.map(children, (element: React.ReactNode, i) => {
        //Check if element is an element that React can render
        if (!React.isValidElement(element)) return element;

        //destructure element properties
        const { props } = element;

        const xpathComponentId = getXpathId(
          element,
          xpathId,
          componentIndexMap,
          currentIndexMap
        );

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
            getSubTree(props.children, dispatch, xpathId + "/a")
          );
        }

        //wrap element in higher order component to add needed properties to it and call getSubTree function recursively
        const wrappedElement = createElement(
          IdWrapper as any,
          {
            ...props,
            xpathId: xpathId,
            loopIndex: i,
            xpathComponentId,
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
