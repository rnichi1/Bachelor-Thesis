import * as React from "react";
import { createElement, ReactNode, useCallback, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { ReducerActionEnum } from "../reducer/reducer";
import { action, PossibleAction } from "../types/actions";

export const useSubTree = () => {
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
      children: React.ReactNode | React.ReactNode[],
      dispatch: React.Dispatch<{
        type: ReducerActionEnum;
        newUserAction?: action | undefined;
        newIdObject?: { id: string; element: React.ReactNode } | undefined;
      }>
    ): React.ReactNode | React.ReactNode[] => {
      //define clone function
      function clone(element: React.ReactElement, elementId: string) {
        //Overwrite submit function, but keep old functionality
        function handleSubmit(e: any) {
          if (props.onSubmit) props.onSubmit(e);
          console.log("You clicked submit for the injected function.");
        }

        const { props, type } = element;

        return React.cloneElement(
          element,
          type === "form"
            ? {
                ...props,
                onSubmit: handleSubmit,
                uuid: elementId,
              }
            : {
                ...props,
                onClick: (e: any) => {
                  console.log(
                    "the ",
                    element.type,
                    " with id ",
                    elementId,
                    " was clicked on ",
                    new Date()
                  );
                  if (props.onClick) {
                    props.onClick(e);
                  }
                  dispatch({
                    type: ReducerActionEnum.UPDATE_ACTIONS,
                    newUserAction: {
                      actionType: PossibleAction.CLICK,
                      timestamp: e.nativeEvent.timeStamp,
                      elementId: elementId,
                    },
                  });

                  dispatch({
                    type: ReducerActionEnum.UPDATE_IDS,
                    newIdObject: {
                      id: elementId,
                      element: element,
                    },
                  });

                  console.log(e);
                },

                uuid: elementId,
              },
          //add children and recursively call this function
          React.Children.map(props.children, (grandchild: React.ReactNode) => {
            return getSubTree(grandchild, dispatch);
          })
        );
      }

      return React.Children.map(children, (element: React.ReactNode) => {
        //Check if element is an element that React can render
        if (!React.isValidElement(element)) return element;

        //destructure element properties
        const { props, type } = element;

        //assign unique id
        const elementId = uuid();

        //create new ReactNode object to save created / copied element into
        let childElement: React.ReactNode;

        //if child is functional component, add span around it to be able to add onClick function
        if (typeof type === "function" || typeof type === "object") {
          //create new span around functional element
          childElement = createElement(
            "span",
            {
              onClick: (e: any) => {
                console.log(
                  "the ",
                  type,
                  " with id ",
                  elementId,
                  " was clicked on ",
                  new Date()
                );
                if (props.onClick) {
                  props.onClick(e);
                }

                dispatch({
                  type: ReducerActionEnum.UPDATE_ACTIONS,
                  newUserAction: {
                    actionType: PossibleAction.CLICK,
                    timestamp: e.nativeEvent.timeStamp,
                    elementId: elementId,
                  },
                });

                dispatch({
                  type: ReducerActionEnum.UPDATE_IDS,
                  newIdObject: {
                    id: elementId,
                    element: element,
                  },
                });
                console.log(e);
              },
              uuid: elementId,
            },
            //clone actual functional component
            clone(element, elementId)
          );
        } else {
          //clone element to replace props
          childElement = clone(element, elementId);
        }

        return childElement;
      });
    },
    []
  );

  return useMemo(() => {
    return { getSubTree, getChildren };
  }, [getSubTree, getChildren]);
};
