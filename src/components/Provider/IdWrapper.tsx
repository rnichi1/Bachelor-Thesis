import * as React from "react";
import { useContext } from "react";
import { ReducerActionEnum } from "../../reducer/reducer";
import { PossibleAction } from "../../types/actions";
import { DataContext } from "./Provider";
import { useSubTree } from "../../hooks/useSubTree";

//This wrapper provides a layer to each element and functional/class component found inside the react tree. It acts as a relay for each component and adds relevant props and a unique identifier to them so that their data can be collected.
export const IdWrapper = ({
  children,
  parentId,
  loopIndex,
}: {
  children: React.ReactNode | React.ReactNode[];
  parentId: string;
  loopIndex: number;
}) => {
  /* This id could be used instead of the parent + child info. useId creates an Id with the react-tree as well and could be used as a native, react specific implementation of id, but due to
  /* changes in the react API in the future, this could break quite easily as it is not necessarily provided to be used as an ID in the way this library employs it.
  /* useId only works with version React 18 and higher!
   const id = useId();
  */

  //Hook for getting and setting persistent state
  const { dispatch } = useContext(DataContext);
  //Hook for getting the function for traversing the tree
  const { getSubTree } = useSubTree();

  return React.Children.map(children, (element: React.ReactNode) => {
    if (!React.isValidElement(element)) return element;

    const { type } = element;

    //add child info to id
    let componentId = parentId + "-" + type + "_" + loopIndex;

    let childElement: React.ReactNode;
    //add span to all functional components and class components, except routes, such that click events are possible
    if (typeof type === "function") {
      //mark it as the actual functional component with the "fc" in the id
      componentId =
        parentId + "-fc_" + (type as Function).name + "_" + loopIndex;
      //check that it is not a React Router specific component
      if (
        !((type as Function).name === "Route") &&
        !((type as Function).name === "Switch") &&
        !((type as Function).name === "Redirect") &&
        !((type as Function).name === "Redirect")
      ) {
        childElement = clone((type as Function)(), componentId);
      } else {
        childElement = clone(element, componentId);
      }
    } else {
      childElement = clone(element, componentId);
    }

    return childElement;
  });

  function clone(element: React.ReactElement, componentId: string) {
    //Overwrite submit function, but keep old functionality
    function handleSubmit(e: any) {
      e.stopPropagation();
      if (props.onSubmit) props.onSubmit(e);
      console.log("You clicked submit for the injected function.");
    }

    const { props, type } = element;

    let element_children = [];

    //check for routes
    if ((element.type as Function).name === "Route") {
      if (element.props.component) {
        element_children = props.component().props.children;
      } else if (element.props.render) {
        element_children = props.render().props.children;
      } else {
        element_children = props.children;
      }
    } else {
      element_children = props.children;
    }

    return React.cloneElement(
      element,
      type === "form"
        ? {
            ...props,
            onSubmit: handleSubmit,
            uuid: componentId,
          }
        : {
            ...props,
            component: null,
            render: null,
            onClick: (e: any) => {
              e.stopPropagation();
              e.persist();
              console.log(
                "the ",
                element.type,
                " with id ",
                componentId,
                " was clicked on ",
                new Date(),
                ". Here is the element: ",
                element
              );
              dispatch({
                type: ReducerActionEnum.UPDATE_ACTIONS,
                newUserAction: {
                  actionType: PossibleAction.CLICK,
                  timestamp: e.nativeEvent.timeStamp,
                  elementId: componentId,
                },
              });

              dispatch({
                type: ReducerActionEnum.UPDATE_IDS,
                newIdObject: {
                  id: componentId,
                  element: element,
                },
              });
            },
            uuid: componentId,
          },
      //add children and recursively call this function

      getSubTree(element_children, dispatch, componentId)
    );
  }
};
