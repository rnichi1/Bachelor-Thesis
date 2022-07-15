import * as React from "react";
import {
  createElement,
  ForwardedRef,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { v4 as uuid } from "uuid";
import { ReducerActionEnum, ReducerState } from "../reducer/reducer";
import { action, PossibleAction } from "../types/actions";

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
      state: ReducerState
    ): React.ReactNode | React.ReactNode[] => {
      //define clone function
      function clone(element: React.ReactElement, elementId: string) {
        //Overwrite submit function, but keep old functionality
        function handleSubmit(e: any) {
          if (props.onSubmit) props.onSubmit(e);
          console.log("You clicked submit for the injected function.");
        }

        const { props, type } = element;

        let children = [];

        //check for routes
        if ((element.type as Function).name === "Route") {
          if (element.props.component) {
            children = props.component().props.children;
          } else if (element.props.render) {
            children = props.render().props.children;
          } else {
            children = props.children;
          }
        } else {
          children = props.children;
        }

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
                component: null,
                render: null,
                onClick: (e: any) => {
                  e.persist();
                  console.log(
                    "the ",
                    element.type,
                    " with id ",
                    elementId,
                    " was clicked on ",
                    new Date(),
                    ". Here is the element: ",
                    element
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

                key: elementId,
              },
          //add children and recursively call this function
          React.Children.map(children, (grandchild: React.ReactNode) => {
            return getSubTree(grandchild, dispatch, state);
          })
        );
      }

      return React.Children.map(
        children,
        (element: React.ReactNode | Function) => {
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
          const { props, type } = element;
          let elementId = "";
          if (Array.from(state.ids.values()).includes(element)) {
            const elementId = Array.from(state.ids.keys())[
              Array.from(state.ids.values()).findIndex((e) => e === element)
            ];
            console.log(
              "element already included in id array, fetched id for element",
              element,
              "id",
              elementId
            );
          } else {
            elementId = uuid();
          }

          //create new ReactNode object to save created / copied element into
          let childElement: React.ReactNode;

          //if child is functional component, add span around it to be able to add onClick function
          if (typeof type === "function" || typeof type === "object") {
            //create new span around functional element
            childElement = createElement(
              "span",
              {
                onClick: (e: any) => {
                  e.persist();
                  console.log(
                    "the ",
                    type,
                    " with id ",
                    elementId,
                    " was clicked on ",
                    new Date(),
                    ". Here is the element: ",
                    element
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
                key: elementId,
              },
              //clone actual functional component
              clone(element, elementId)
            );
          } else {
            //clone element to replace props
            childElement = clone(element, elementId);
          }

          return childElement;
        }
      );
    },
    []
  );

  return useMemo(() => {
    return { getSubTree };
  }, [getSubTree]);
};
