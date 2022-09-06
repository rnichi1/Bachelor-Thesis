import * as React from "react";
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ReducerActionEnum } from "../../reducer/reducer";
import { PossibleAction } from "../../types/actions";
import { useSubTree } from "../../hooks/useSubTree";
import { DataContext } from "../DataContext";

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
  hasLink,
  parentId,
}: {
  children: React.ReactElement;
  xpathComponentId: string;
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
    injectHoc,
    getCurrentGuiState,
    recursivelyInstantiateFunctionalComponent,
  } = useSubTree();

  /** ref for current element */
  const ref: React.MutableRefObject<HTMLElement> = useRef<any>();

  /** for input components to keep track of their input value */
  const [currentInput, setCurrentInput] = useState("");

  /** callback function for setting input with an async function, such that library waits for the variable to update before recording new state */
  const setCurrentInputSynchronously = useCallback(async (input: string) => {
    setCurrentInput(input);
  }, []);

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
    /** injects new change functionality for inputs */
    const handleChange = async (e: any) => {
      e.persist();

      // call the existing onChange function, such that no original functionality gets lost.
      if (props.onChange) props.onChange(e);

      await setCurrentInputSynchronously(e.target.value);

      /** the GUI state after the action functionality has been executed. */
      const currentGuiState = await getCurrentGuiState(
        parentId,
        state,
        currentRoute.pathname
      );

      /** Previous state recorded by the last action */
      const prevGuiState = state.actions[state.actions.length - 1]?.nextState;

      // save the action data to the global storage
      state.walkthroughActive &&
        dispatch({
          type: ReducerActionEnum.UPDATE_ACTIONS,
          newUserAction: {
            action: {
              actionType: PossibleAction.INPUT,
              elementId: xpathComponentId,
              prevStateId: prevGuiState.stateId,
              currentGuiStateId: currentGuiState.stateId,
              prevState: prevGuiState,
              nextState: currentGuiState,
              wasPropagated: false,
              timestamp: new Date().getTime(),
            },
            prevActionWasRouting: false,
          },
        });

      // save the current gui state in the global storage
      state.walkthroughActive &&
        dispatch({
          type: ReducerActionEnum.UPDATE_GUI_STATES,
          newGuiState: currentGuiState,
        });
    };

    /** injects new submit functionality */
    const handleSubmit = async (e: any) => {
      e.persist();
      e.preventDefault();
      if (hasLink) {
        e.stopPropagation();
      }

      // check if this is the element the user did the action on
      const wasPropagatedEvent = e.target !== e.currentTarget;

      // call the existing onSubmit function, such that no original functionality gets lost.
      if (props.onSubmit) props.onSubmit(e);

      /** the GUI state after the action functionality has been executed. */
      const currentGuiState = await getCurrentGuiState(
        parentId,
        state,
        currentRoute.pathname
      );

      /** Previous state recorded by the last action */
      const prevGuiState = state.actions[state.actions.length - 1]?.nextState;

      // save the action data to the global storage
      state.walkthroughActive &&
        dispatch({
          type: ReducerActionEnum.UPDATE_ACTIONS,
          newUserAction: {
            action: {
              actionType: PossibleAction.SUBMIT,
              elementId: xpathComponentId,
              prevStateId: prevGuiState.stateId,
              currentGuiStateId: currentGuiState.stateId,
              prevState: prevGuiState,
              nextState: currentGuiState,
              wasPropagated: wasPropagatedEvent,
              timestamp: new Date().getTime(),
            },
            prevActionWasRouting: false,
          },
        });

      // save the current gui state in the global storage
      state.walkthroughActive &&
        dispatch({
          type: ReducerActionEnum.UPDATE_GUI_STATES,
          newGuiState: currentGuiState,
        });
    };

    /** injects new click functionality */
    const handleClick = async (e: any) => {
      e.persist();
      if (hasLink) {
        e.stopPropagation();
      }

      // check if this is the element the user did the action on
      const wasPropagatedEvent = e.target !== e.currentTarget;

      // call the existing onClick function, such that no original functionality gets lost.
      props.onClick && props.onClick(e);

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
      state.walkthroughActive &&
        dispatch({
          type: ReducerActionEnum.UPDATE_ACTIONS,
          newUserAction: {
            action: {
              actionType: hasLink ? PossibleAction.ROUTE : PossibleAction.CLICK,
              elementId: xpathComponentId,
              prevStateId: prevGuiState.stateId,
              currentGuiStateId: currentGuiState.stateId,
              prevState: prevGuiState,
              nextState: currentGuiState,
              wasPropagated: wasPropagatedEvent,
              timestamp: new Date().getTime(),
            },
            prevActionWasRouting: prevActionWasRouting,
          },
        });

      // save the current gui state in the global storage
      state.walkthroughActive &&
        dispatch({
          type: ReducerActionEnum.UPDATE_GUI_STATES,
          newGuiState: currentGuiState,
        });
    };

    // destructure element type and props
    const { props, type } = element;

    /** children of element */
    let element_children = [];

    //check for routes and handle possible props accordingly
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
    const subTree = injectHoc(
      element_children,
      dispatch,
      xpathComponentId,
      parentId,
      ref
    );

    return React.cloneElement(
      element,
      {
        // keep the original props
        ...props,
        // change relevant properties for Routes such that they don't interfere with the children prop
        component: undefined,
        render: undefined,
        // overwrite the onClick function, such that it sends data to the global storage.
        onClick: handleClick,
        // overwrite the onSubmit function, such that it sends data to the global storage, if the element is a form.
        onSubmit: type === "form" ? handleSubmit : props.onSubmit,
        // overwrite the onChange function, such that it sends data to the global storage, if the element is an input field.
        onChange: type === "input" ? handleChange : props.onChange,
        // input value used for state changes
        inputvalue: currentInput ? currentInput : undefined,
        // id of current element
        xpathid: xpathComponentId,
        // ref to current element in DOM
        ref: ref,
      },
      subTree
    );
  }
};
