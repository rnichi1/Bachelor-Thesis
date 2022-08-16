import * as React from "react";
import { useCallback, useContext, useEffect, useRef } from "react";
import { ReducerActionEnum } from "../../reducer/reducer";
import { PossibleAction } from "../../types/actions";
import { DataContext, XPATH_ID_BASE } from "./Provider";
import { useSubTree } from "../../hooks/useSubTree";

//This wrapper provides a layer to each element and functional/class component found inside the react tree. It acts as a relay for each component and adds relevant props and a unique identifier to them so that their data can be collected.
export const IdWrapper = ({
  children,
  xpathId,
  loopIndex,
  xpathComponentId,
  typeMap,
}: {
  children: React.ReactElement;
  xpathId: string;
  loopIndex: number;
  xpathComponentId: string;
  typeMap: Map<string | undefined, string>;
}) => {
  /* This id could be used instead of the xpath ids. useId creates an Id with the react-tree as well and could be used as a native, react specific implementation of id, but due to
   changes in the react API in the future, this could break quite easily as it is not necessarily provided to be used as an ID in the way this library employs it.
   useId only works with version React 18 and higher!

   const id = useId();
  */

  //Hook for getting and setting persistent state
  const { dispatch, saveCurrentGuiState, firstParent, state } =
    useContext(DataContext);
  //Hook for getting the functions for traversing the tree
  const { getSubTree, getCurrentGuiState } = useSubTree();

  //create ref for element
  const ref: React.MutableRefObject<HTMLElement> = useRef<any>();

  const { type } = children;

  let childElement: React.ReactNode;

  if (typeof type === "function") {
    //check that it is not a React Router specific component
    if (
      !((type as Function).name === "Route") &&
      !((type as Function).name === "Switch") &&
      !((type as Function).name === "Redirect")
    ) {
      childElement = clone((type as Function)(), xpathComponentId);
    } else {
      xpathComponentId = xpathId;
      childElement = clone(children, xpathComponentId);
    }
  } else {
    childElement = clone(children, xpathComponentId);
  }

  // save reference to dom element in global storage
  useEffect(() => {
    if (typeof type === "function") {
      if (
        (type as Function).name === "Route" ||
        (type as Function).name === "Switch" ||
        (type as Function).name === "Redirect"
      ) {
        return;
      }
    }

    dispatch({
      type: ReducerActionEnum.UPDATE_REFS,
      newRefObject: { ref: ref, id: xpathComponentId },
    });
  }, [dispatch, xpathComponentId, type]);

  return childElement;

  function clone(element: React.ReactElement, xpathComponentId: string) {
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
            xpathId: xpathComponentId,
          }
        : {
            ...props,
            component: null,
            render: null,
            onClick: async (e: any) => {
              e.persist();
              props.onClick && (await props.onClick());

              const currentGuiState = await getCurrentGuiState(
                firstParent,
                XPATH_ID_BASE,
                state,
                typeMap
              );

              console.log(
                "the ",
                element.type,
                " with id ",
                xpathComponentId,
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
                  elementId: xpathId,
                },
              });

              dispatch({
                type: ReducerActionEnum.UPDATE_IDS,
                newIdObject: {
                  id: xpathId,
                  element: element,
                },
              });

              //save the current gui state in the global storage
              saveCurrentGuiState(currentGuiState);
            },
            xpathid: xpathComponentId,
            ref: ref,
          },

      //add children and recursively call subTree function
      getSubTree(element_children, dispatch, xpathComponentId, typeMap)
    );
  }
};
