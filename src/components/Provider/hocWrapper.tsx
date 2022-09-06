import * as React from "react";
import { ReactElement, useContext, useEffect, useRef } from "react";
import { ReducerActionEnum } from "../../reducer/reducer";
import { PossibleAction } from "../../types/actions";
import { DataContext } from "./Provider";
import { useSubTree } from "../../hooks/useSubTree";
import { TypeMapValueType } from "../../helpers/typeMap";

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
  xpathComponentId,
  typeMap,
  hasLink,
  parentId,
}: {
  children: React.ReactElement;
  xpathComponentId: string;
  typeMap: Map<string | undefined, TypeMapValueType>;
  hasLink?: boolean;
  parentId?: string;
}) => {
  /* This id could be used instead of the xpath ids. useId creates an Id with the react-tree as well and could be used as a native, react specific implementation of id, but due to
   changes in the react API in the future, this could break quite easily as it is not necessarily provided to be used as an ID in the way this library employs it.
   useId only works with version React 18 and higher!

   const id = useId();
  */

  // Hook for getting and setting persistent state
  const { dispatch, state, currentRoute } = useContext(DataContext);

  // custom hooks
  const {
    getSubTree,
    getCurrentGuiState,
    recursivelyInstantiateFunctionalComponent,
  } = useSubTree();

  /** ref for current element */
  const ref: React.MutableRefObject<HTMLElement> = useRef<any>();

  // destructure type and props
  const { type, props } = children;

  /** variable for childElement */
  let childElement: React.ReactNode;

  if (
    typeof type === "function" &&
    !props.children &&
    !(type as any).prototype?.isReactComponent
  ) {
    /** deep instantiated functional components in order to get the actual element rendered to the DOM */
    const instantiatedFc = recursivelyInstantiateFunctionalComponent(children);

    // Check if instantiated functional component is an element that React can render, if not it needs to be handled correctly
    if (!React.isValidElement(instantiatedFc) || !instantiatedFc) {
      childElement = null;
    } else {
      childElement = clone(instantiatedFc, xpathComponentId);
    }
  } else {
    childElement = clone(children, xpathComponentId);
  }

  /*if (typeof type === "function") {
    if (!!(type as any).prototype?.isReactComponent) {
      if (ref.current && (ReactDOM.findDOMNode(ref.current) as any)) {
        console.log(ref.current, type, ReactDOM.findDOMNode(ref.current));
      }
    }
  }*/

  // save reference to dom element in global storage
  useEffect(() => {
    if (
      (type as Function).name === "Route" ||
      (type as Function).name === "Switch" ||
      (type as Function).name === "Redirect" ||
      !xpathComponentId
    ) {
      return;
    }

    dispatch({
      type: ReducerActionEnum.UPDATE_REFS,
      newRefObject: { ref: ref, id: xpathComponentId },
    });
  }, [dispatch, xpathComponentId, type]);

  return childElement as ReactElement;

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

      // call the old onClick function, such that no original functionality gets lost.
      props.onClick && props.onClick();

      /** the GUI state after the action functionality has been executed. */
      const currentGuiState = await getCurrentGuiState(
        parentId,
        state,
        currentRoute.pathname
      );

      /** Previous state recorded by the last action */
      const prevGuiState = hasLink
        ? currentGuiState
        : state.actions[state.actions.length - 1]?.nextState;

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
            nextState: currentGuiState,
            prevState: prevGuiState,
          },
          prevActionWasRouting: prevActionWasRouting,
        },
      });

      // save the current gui state in the global storage
      dispatch({
        type: ReducerActionEnum.UPDATE_GUI_STATES,
        newGuiState: currentGuiState,
      });
    };

    const { props, type } = element;

    let element_children = [];

    //check for routes
    if ((element.type as Function).name === "Route") {
      if (element.props.component) {
        element_children = props.component();
      } else if (element.props.render) {
        element_children = props.render;
      } else {
        element_children = props.children;
      }
    } else {
      element_children = props.children;
    }

    // add children and recursively call getSubTree function, which wraps all children in the HOC.
    const subTree = getSubTree(
      element_children,
      dispatch,
      xpathComponentId,
      typeMap,
      parentId,
      ref
    );

    return React.cloneElement(
      element,
      {
        // keep the original props
        ...props,
        // change relevant properties

        component: undefined,
        render: undefined,
        // overwrite the onClick function, such that it sends data to the global storage.
        onClick: handleClick,
        // overwrite the onSubmit function, such that it sends data to the global storage, if the element is a form.
        onSubmit: type === "form" ? handleSubmit : props.onSubmit,
        xpathid: xpathComponentId,
        ref: ref,
      },
      subTree
    );
  }
};
