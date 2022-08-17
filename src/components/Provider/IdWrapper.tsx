import * as React from "react";
import { useCallback, useContext, useEffect, useRef } from "react";
import { ReducerActionEnum } from "../../reducer/reducer";
import { PossibleAction } from "../../types/actions";
import { DataContext, XPATH_ID_BASE } from "./Provider";
import { useSubTree } from "../../hooks/useSubTree";
import { useLocation } from "react-router-dom";
import { Widget } from "../../types/guiState";
import { useGuiStateId } from "../../hooks/useGuiStateId";

/** This wrapper provides a layer to each element and functional/class component found inside the react tree. It acts as a relay for each component and adds relevant props and a unique identifier to them so that their data can be collected.
 * @param children wrapped component.
 * @param xpathId id of wrapped component's parent component.
 * @param xpathComponentId id of wrapped component.
 * @param hasLink boolean to determine if there is a Link wrapping the element, in order to know when to stop propagation of user events. This needs to be true, when there is a link present, in order for routing to work. It might work without this as well,
 * but for safety measures it is included. It is also used for identifying a route action.
 * @param typeMap a map of types of each functional component inside the application, used for the xpath id.
 * */
export const IdWrapper = ({
  children,
  xpathId,
  xpathComponentId,
  typeMap,
  hasLink,
}: {
  children: React.ReactElement;
  xpathId: string;
  xpathComponentId: string;
  typeMap: Map<string | undefined, string>;
  hasLink?: boolean;
}) => {
  /* This id could be used instead of the xpath ids. useId creates an Id with the react-tree as well and could be used as a native, react specific implementation of id, but due to
   changes in the react API in the future, this could break quite easily as it is not necessarily provided to be used as an ID in the way this library employs it.
   useId only works with version React 18 and higher!

   const id = useId();
  */

  //Hook for getting and setting persistent state
  const { dispatch, saveCurrentGuiState, firstParent, state } =
    useContext(DataContext);

  //custom hooks
  const { getSubTree, getCurrentGuiState } = useSubTree();
  const { getGuiStateId } = useGuiStateId();

  //get current route
  const location = useLocation();

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
              if (hasLink) {
                e.stopPropagation();
              }

              const prevGuiState = await getCurrentGuiState(
                firstParent,
                XPATH_ID_BASE,
                state,
                typeMap,
                location.pathname
              );

              props.onClick && (await props.onClick());

              // Check if it is the actually clicked on target, or just one that the event got propagated to.
              if (e.target === ref.current) {
                const currentGuiState = await getCurrentGuiState(
                  firstParent,
                  XPATH_ID_BASE,
                  state,
                  typeMap,
                  location.pathname
                );

                const prevGuiStateID = await getGuiStateId(
                  state,
                  prevGuiState,
                  location.pathname
                );

                const currentGuiStateID = await getGuiStateId(
                  state,
                  currentGuiState,
                  location.pathname
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
                    actionType: hasLink
                      ? PossibleAction.ROUTE
                      : PossibleAction.CLICK,
                    timestamp: e.nativeEvent.timeStamp,
                    elementId: xpathComponentId,
                    nextState: {
                      widgetArray: currentGuiState ? currentGuiState : [],
                      currentRoute: location.pathname,
                      stateId: currentGuiStateID,
                    },
                    prevState: {
                      widgetArray: prevGuiState ? prevGuiState : [],
                      currentRoute: location.pathname,
                      stateId: prevGuiStateID,
                    },
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
                saveCurrentGuiState(
                  currentGuiState,
                  location.pathname,
                  state,
                  currentGuiStateID
                );
              }
            },
            xpathid: xpathComponentId,
            ref: ref,
          },

      //add children and recursively call subTree function
      getSubTree(element_children, dispatch, xpathComponentId, typeMap, hasLink)
    );
  }
};
