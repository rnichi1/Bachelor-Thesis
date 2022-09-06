import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useState,
} from "react";
import { useSubTree } from "../../hooks/useSubTree";
import {
  initialState,
  reducer,
  ReducerActionEnum,
} from "../../reducer/reducer";
import { ActionType, ReducerState } from "../../types/reducerTypes";
import { useGuiStateId } from "../../hooks/useGuiStateId";
import { PossibleAction } from "../../types/actions";
import { Location } from "history";

export const XPATH_ID_BASE = "/html/body/div";

/** Context to save GUI state data in global state */
export const DataContext = createContext<{
  state: ReducerState;
  dispatch: React.Dispatch<ActionType>;
  firstParent: React.ReactNode | React.ReactNode[];
  currentRoute: Location<unknown>;
  firstXpathId: string;
}>({
  state: {
    actions: [],
    ids: new Map(),
    refs: new Map(),
    guiStates: [],
    walkthroughActive: false,
  },
  dispatch: () => {},
  firstParent: undefined,
  currentRoute: { pathname: "/" } as Location<unknown>,
  firstXpathId: "",
});

const Provider = ({
  currentRoute,
  children,
  firstXpathId,
}: {
  currentRoute: Location<unknown>;
  firstXpathId: string;
  children?: React.ReactNode | React.ReactNode[];
}) => {
  //custom hooks
  const { getSubTree } = useSubTree();

  const [state, dispatch] = useReducer(reducer, initialState);

  /*//get type map for all functional components inside application
  const functionalComponentTypes = getFunctionalComponentTypes({
    children: children,
  });

  const typeMap: Map<string | undefined, TypeMapValueType> = getTypeMap(
    functionalComponentTypes
  );*/

  return (
    <>
      <DataContext.Provider
        value={{
          state,
          dispatch,
          firstParent: children,
          currentRoute,
          firstXpathId,
        }}
      >
        <StartWalkthroughButton />
        {children
          ? getSubTree(children, dispatch, XPATH_ID_BASE, firstXpathId)
          : null}
      </DataContext.Provider>
    </>
  );
};

export const CustomButton = ({ exampleProp }: { exampleProp: string }) => {
  return <CustomLayer exampleProp={exampleProp} />;
};

export const CustomLayer = ({ exampleProp }: { exampleProp: string }) => {
  const [color, setColor] = useState("red");
  const [width, setWidth] = useState("300px");
  const [showOne, setShowOne] = useState(false);

  return (
    <div>
      <button
        style={{ height: "200px", color: color, width: width }}
        onClick={() => {
          if (color === "blue") setWidth("350px");
          setColor("blue");
        }}
      >
        <div>this is a custom button, can you see its child div?</div>
        <div>this is a custom button, can you see its child div?</div>
      </button>
      {showOne && (
        <div>
          <div>This is show one</div>
        </div>
      )}
      <button
        onClick={() => {
          setShowOne(!showOne);
        }}
      >
        show one
      </button>
    </div>
  );
};

/** Buttons for starting and ending a walkthrough and to print the collected data. They can be moved with the buttons provided, in case that they cover any relevant GUI elements. */
export const StartWalkthroughButton = () => {
  let { state, firstParent, dispatch, currentRoute, firstXpathId } =
    useContext(DataContext);

  //custom hooks
  const { getCurrentGuiState } = useSubTree();
  const { getGuiStateId } = useGuiStateId();

  const [uiButtonPlacement, setUiButtonPlacement] = useState(2);
  const [uiButtonPlacementRight, setUiButtonPlacementRight] = useState(2);

  const startWalkthrough = useCallback(async () => {
    const initialGuiState = await getCurrentGuiState(
      firstXpathId,
      state,
      currentRoute.pathname
    );

    dispatch({ type: ReducerActionEnum.START_WALKTHROUGH });

    dispatch({
      type: ReducerActionEnum.UPDATE_ACTIONS,
      newUserAction: {
        action: {
          actionType: PossibleAction.START_WALKTHROUGH,
          timestamp: new Date().getTime(),
          elementId: "start-walkthrough-button",
          nextState: initialGuiState,
          prevState: initialGuiState,
        },
        prevActionWasRouting: false,
      },
    });

    // save the current gui state in the global storage
    dispatch({
      type: ReducerActionEnum.UPDATE_GUI_STATES,
      newGuiState: initialGuiState,
    });
  }, [
    firstParent,
    getCurrentGuiState,
    state,
    currentRoute.pathname,
    getGuiStateId,
    firstXpathId,
  ]);

  const endWalkthrough = useCallback(async () => {
    const finalGuiState = await getCurrentGuiState(
      firstXpathId,
      state,
      currentRoute.pathname
    );

    //check if routing action needs to adjust previous state variable
    const prevActionWasRouting =
      state.actions[state.actions.length - 1] &&
      state.actions[state.actions.length - 1].actionType === "ROUTE";

    dispatch({ type: ReducerActionEnum.END_WALKTHROUGH });

    dispatch({
      type: ReducerActionEnum.UPDATE_ACTIONS,
      newUserAction: {
        action: {
          actionType: PossibleAction.END_WALKTHROUGH,
          timestamp: new Date().getTime(),
          elementId: "end-walkthrough-button",
          nextState: finalGuiState,
          prevState: finalGuiState,
        },
        prevActionWasRouting: prevActionWasRouting,
      },
    });

    // save the current gui state in the global storage
    dispatch({
      type: ReducerActionEnum.UPDATE_GUI_STATES,
      newGuiState: finalGuiState,
    });
  }, [
    firstParent,
    getCurrentGuiState,
    state,
    currentRoute.pathname,
    getGuiStateId,
    firstXpathId,
  ]);

  return (
    <div
      style={{
        position: "absolute",
        right: `${uiButtonPlacementRight}%`,
        top: `${uiButtonPlacement}%`,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "5px",
        }}
      >
        Testing
      </div>
      <button
        style={{
          width: "100px",
          height: "50px",
        }}
        onClick={() => {
          console.log("current action data", state.actions);
          console.log("current component ids", state.ids);
          console.log("current refs", state.refs);
          console.log("encountered Gui States", state.guiStates);
          console.log("is walkthrough active", state.walkthroughActive);
        }}
      >
        Print Data to Console
      </button>
      <button
        style={{
          color: "green",
          width: "100px",
          height: "40px",
          display: state.walkthroughActive ? "none" : "block",
        }}
        onClick={startWalkthrough}
      >
        Start Walkthrough
      </button>

      <button
        style={{
          color: "red",
          width: "100px",
          height: "40px",
          display: !state.walkthroughActive ? "none" : "block",
        }}
        onClick={endWalkthrough}
      >
        End Walkthrough
      </button>

      <div>
        <div
          style={{
            paddingTop: "15px",
            paddingBottom: "5px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          Move Buttons
        </div>
        <div>
          <button
            style={{
              color: "blue",
              width: "50px",
              height: "40px",
            }}
            onClick={(uiButtonPlacement) =>
              setUiButtonPlacement((uiButtonPlacement) => uiButtonPlacement - 4)
            }
          >
            Up
          </button>

          <button
            style={{
              color: "blue",
              width: "50px",
              height: "40px",
            }}
            onClick={() => {
              setUiButtonPlacementRight(
                (uiButtonPlacementRight) => uiButtonPlacementRight + 4
              );
            }}
          >
            Left
          </button>
        </div>
        <div>
          <button
            style={{
              color: "blue",
              width: "50px",
              height: "40px",
            }}
            onClick={(uiButtonPlacement) =>
              setUiButtonPlacement((uiButtonPlacement) => uiButtonPlacement + 4)
            }
          >
            Down
          </button>

          <button
            style={{
              color: "blue",
              width: "50px",
              height: "40px",
            }}
            onClick={(uiButtonPlacement) =>
              setUiButtonPlacementRight(
                (uiButtonPlacementRight) => uiButtonPlacementRight - 4
              )
            }
          >
            Right
          </button>
        </div>
      </div>
    </div>
  );
};

type InputProps = {
  children?: React.ReactNode | React.ReactNode[];
  placeholder: string;
};

export const CustomInput = ({ children, placeholder }: InputProps) => {
  return <input placeholder={placeholder}>{children}</input>;
};

export default Provider;
