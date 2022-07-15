import * as React from "react";
import {
  cloneElement,
  createElement,
  ReactElement,
  ReactNode,
  useContext,
  useId,
} from "react";
import { ReducerActionEnum } from "../../reducer/reducer";
import { PossibleAction } from "../../types/actions";
import { DataContext } from "./Provider";
import { useSubTree } from "../../hooks/useSubTree";

export const IdWrapper = ({
  children,
  parentId,
}: {
  children: React.ReactNode | React.ReactNode[];
  parentId: string;
}) => {
  const id = useId();

  const { dispatch, state } = useContext(DataContext);

  const { getSubTree } = useSubTree();

  return React.Children.map(children, (element: React.ReactNode, index) => {
    if (!React.isValidElement(element)) return element;

    const { props, type } = element;

    let componentId = parentId;

    let childElement: React.ReactNode;
    //add span to all functional components and class components, except routes, such that click events are possible
    if (
      (typeof type === "function" || typeof type === "object") &&
      !((type as Function).name === "Route")
    ) {
      componentId = parentId + "_fc";

      //create new span around functional element
      const spanWrapper = createElement(
        "span",
        {
          onClick: (e: any) => {
            e.persist();
            console.log(
              "the ",
              type,
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
                elementId: id,
              },
            });

            dispatch({
              type: ReducerActionEnum.UPDATE_IDS,
              newIdObject: {
                id: id,
                element: element,
              },
            });
            console.log(e);
          },
        },
        clone(element, index)
      );
      childElement = spanWrapper;
    } else {
      childElement = clone(element, index);
    }

    return childElement;
  });

  function clone(element: React.ReactElement, index: number) {
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
            uuid: id,
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
                id,
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
                  elementId: id,
                },
              });

              dispatch({
                type: ReducerActionEnum.UPDATE_IDS,
                newIdObject: {
                  id: id,
                  element: element,
                },
              });

              console.log(e);
            },

            uuid: id,
          },
      //add children and recursively call this function
      React.Children.map(children, (grandchild: React.ReactNode) => {
        return getSubTree(grandchild, dispatch, parentId + index);
      })
    );
  }
};
