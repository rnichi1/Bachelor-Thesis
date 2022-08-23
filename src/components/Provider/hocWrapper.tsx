import * as React from "react";
import { useContext, useEffect, useRef } from "react";
import { ReducerActionEnum } from "../../reducer/reducer";
import { PossibleAction } from "../../types/actions";
import { DataContext, XPATH_ID_BASE } from "./Provider";
import { useSubTree } from "../../hooks/useSubTree";
import { useGuiStateId } from "../../hooks/useGuiStateId";
import ReactDOM from "react-dom";
import { types } from "util";

/** This wrapper provides a layer to each element and functional/class component found inside the react tree. It acts as a relay for each component and adds relevant props and a unique identifier to them so that their data can be collected.
 * @param children wrapped component.
 * @param xpathId id of wrapped component's parent component.
 * @param xpathComponentId id of wrapped component.
 * @param hasLink boolean to determine if there is a Link wrapping the element, in order to know when to stop propagation of user events. This needs to be true, when there is a link present, in order for routing to work. It might work without this as well,
 * but for safety measures it is included. It is also used for identifying a route action.
 * @param typeMap a map of types of each functional component inside the application, used for the xpath id.
 * */
export const HocWrapper = ({
  children,
  xpathId,
  xpathComponentId,
  typeMap,
  hasLink,
  typesMap,
}: {
  children: React.ReactElement;
  xpathId: string;
  xpathComponentId: string;
  typeMap: Map<string | undefined, string>;
  hasLink?: boolean;
  typesMap: Map<string, number>;
}) => {
  /* This id could be used instead of the xpath ids. useId creates an Id with the react-tree as well and could be used as a native, react specific implementation of id, but due to
   changes in the react API in the future, this could break quite easily as it is not necessarily provided to be used as an ID in the way this library employs it.
   useId only works with version React 18 and higher!

   const id = useId();
  */

  //Hook for getting and setting persistent state
  const { dispatch, saveCurrentGuiState, firstParent, state, currentRoute } =
    useContext(DataContext);

  //custom hooks
  const {
    getSubTree,
    getCurrentGuiState,
    recursivelyInstantiateFunctionalComponent,
  } = useSubTree();
  const { getGuiStateId } = useGuiStateId();

  //create ref for element
  const ref: React.MutableRefObject<HTMLElement> = useRef<any>();

  const { type, props } = children;

  let childElement: React.ReactNode;

  console.log(ReactDOM.findDOMNode(ref.current));
  if (ref.current) {
    if (
      typesMap &&
      typesMap.has((ReactDOM.findDOMNode(ref.current) as any).localName)
    ) {
      typesMap.set(
        (ReactDOM.findDOMNode(ref.current) as any).localName,
        typesMap.get((ReactDOM.findDOMNode(ref.current) as any).localName)! + 1
      );
    } else {
      typesMap.set((ReactDOM.findDOMNode(ref.current) as any).localName, 1);
    }
  }
  //TODO: implement this as a fake xpath with [1] even if theres only one element.
  console.log(typesMap);

  if (typeof type === "function" && !props.children) {
    //check that it is not a React Router specific component
    if (
      !((type as Function).name === "Route") &&
      !((type as Function).name === "Switch") &&
      !((type as Function).name === "Redirect")
    ) {
      // deep instantiate functional components
      const instantiatedFc =
        recursivelyInstantiateFunctionalComponent(children);
      // Check if instantiated functional component is an element that React can render
      if (!React.isValidElement(instantiatedFc)) {
        childElement = instantiatedFc;
      } else {
        childElement = clone(instantiatedFc, xpathComponentId);
      }
    } else {
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

  /** This function clones an element passed to it and adds the necessary data retrieval functionality to each action a user can take on the element. */
  function clone(element: React.ReactElement, xpathComponentId: string) {
    //Overwrite submit function, but keep old functionality
    function handleSubmit(e: any) {
      e.stopPropagation();
      if (props.onSubmit) props.onSubmit(e);
      console.log("You clicked submit for the injected function.");
    }

    const handleClick = async (e: any) => {
      e.persist();
      if (hasLink) {
        e.stopPropagation();
      }

      // await the recording of the GUI state before any changes are made by the original click functionality.
      const prevGuiState = await getCurrentGuiState(
        firstParent,
        XPATH_ID_BASE,
        state,
        typeMap,
        currentRoute.pathname
      );

      // call the old onClick function, such that no original functionality gets lost.
      props.onClick && (await props.onClick());

      // get the GUI state after the click functionality has been executed.
      const currentGuiState = await getCurrentGuiState(
        firstParent,
        XPATH_ID_BASE,
        state,
        typeMap,
        currentRoute.pathname
      );

      // compute GUI state id of previous state
      const prevGuiStateID = await getGuiStateId(state, prevGuiState);

      // compute GUI state id of current state
      const currentGuiStateID = await getGuiStateId(state, currentGuiState);

      // compute if the app routed after the click action
      const prevActionWasRouting =
        state.actions[state.actions.length - 1] &&
        state.actions[state.actions.length - 1].actionType === "ROUTE";

      // save the action data to the global storage
      dispatch({
        type: ReducerActionEnum.UPDATE_ACTIONS,
        newUserAction: {
          action: {
            actionType: hasLink ? PossibleAction.ROUTE : PossibleAction.CLICK,
            timestamp: new Date().getTime(),
            elementId: xpathComponentId,
            nextState: {
              widgetArray: currentGuiState ? currentGuiState : [],
              currentRoute: currentRoute.pathname,
              stateId: currentGuiStateID,
            },
            prevState: {
              widgetArray: prevGuiState ? prevGuiState : [],
              currentRoute: currentRoute.pathname,
              stateId: prevGuiStateID,
            },
          },
          prevActionWasRouting: prevActionWasRouting,
        },
      });

      // save the current gui state in the global storage
      saveCurrentGuiState(
        currentGuiState,
        currentRoute.pathname,
        state,
        currentGuiStateID
      );
    };

    const { props, type } = element;

    let element_children = [];

    //check for routes
    if ((element.type as Function).name === "Route") {
      if (element.props.component) {
        element_children = props.component();
      } else if (element.props.render) {
        element_children = props.render();
      } else {
        element_children = props.children;
      }
    } else {
      element_children = props.children;
    }

    return React.cloneElement(
      element,
      {
        // keep the original props
        ...props,
        // remove the component and render props for Routes
        component: null,
        render: null,
        // overwrite the onClick function, such that it sends data to the global storage.
        onClick: handleClick,
        // overwrite the onSubmit function, such that it sends data to the global storage, if the element is a form.
        onSubmit: type === "form" ? handleSubmit : props.onSubmit,
        xpathid: xpathComponentId,
        ref: ref,
      },

      // add children and recursively call getSubTree function, which wraps all children in the HOC.
      getSubTree(element_children, dispatch, xpathComponentId, typeMap, hasLink)
    );
  }
};
