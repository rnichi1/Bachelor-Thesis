import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { useSubTree } from "../../hooks/useSubTree";
import {
  initialState,
  reducer,
  ReducerActionEnum,
} from "../../reducer/reducer";
import { usePersistedReducer } from "../../hooks/usePersistedReducer";
import { ActionType, ReducerState } from "../../types/reducerTypes";
import { Widget } from "../../types/guiState";
import { getTypeMap, TypeMapValueType } from "../../helpers/typeMap";
import { useGuiStateId } from "../../hooks/useGuiStateId";
import { PossibleAction } from "../../types/actions";
import { Location } from "history";
import { type } from "os";

export const XPATH_ID_BASE = "/html/body/div";

/** Context to save GUI state data in global state */
export const DataContext = createContext<{
  state: ReducerState;
  dispatch: React.Dispatch<ActionType>;
  saveCurrentGuiState: (
    currentGuiState: Widget[] | null | undefined,
    currentRoute: string,
    state: ReducerState,
    guiStateId: number
  ) => void;
  firstParent: React.ReactNode | React.ReactNode[];
  typeMap: Map<string | undefined, TypeMapValueType>;
  currentRoute: Location<unknown>;
}>({
  state: {
    actions: [],
    ids: new Map(),
    refs: new Map(),
    guiStates: [],
    walkthroughActive: false,
  },
  dispatch: () => {},
  saveCurrentGuiState: () => {},
  firstParent: undefined,
  typeMap: new Map(),
  currentRoute: { pathname: "/" } as Location<unknown>,
});

const Provider = ({
  currentRoute,
  children,
}: {
  currentRoute: Location<unknown>;
  children?: React.ReactNode | React.ReactNode[];
}) => {
  //custom hooks
  const { getSubTree, getFunctionalComponentTypes } = useSubTree();

  const reducerKey = "PROVIDER_STATE";
  const { state, dispatch } = usePersistedReducer(
    reducer,
    initialState,
    reducerKey
  );

  //TODO: Think about precomputing Xpaths, meaning to run the same thing as in the hocWrapper once through the whole tree to get the count of all components.

  /** saves current state in global storage */
  const saveCurrentGuiState = useCallback(
    (
      currentGuiState: Widget[] | null | undefined,
      currentRoute: string,
      state: ReducerState,
      guiStateId: number
    ) => {
      if (currentGuiState) {
        dispatch({
          type: ReducerActionEnum.UPDATE_GUI_STATES,
          newGuiState: {
            widgetArray: currentGuiState,
            currentRoute: currentRoute,
            stateId: guiStateId,
          },
        });
      }
    },
    [dispatch]
  );

  //get type map for all functional components inside application
  const functionalComponentTypes = getFunctionalComponentTypes({
    children: children,
  });
  console.log(functionalComponentTypes);
  const typeMap: Map<string | undefined, TypeMapValueType> = getTypeMap(
    functionalComponentTypes
  );
  console.log("typemap", typeMap);

  return (
    <>
      <DataContext.Provider
        value={{
          state,
          dispatch,
          saveCurrentGuiState,
          firstParent: children,
          typeMap: typeMap,
          currentRoute,
        }}
      >
        <StartWalkthroughButton />
        {children
          ? getSubTree(children, dispatch, XPATH_ID_BASE, typeMap)
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

  return (
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
  );
};

/** Buttons for starting and ending a walkthrough and to print the collected data. They can be moved with the buttons provided, in case that they cover any relevant GUI elements. */
export const StartWalkthroughButton = () => {
  const {
    state,
    firstParent,
    saveCurrentGuiState,
    typeMap,
    dispatch,
    currentRoute,
  } = useContext(DataContext);

  //custom hooks
  const { getCurrentGuiState } = useSubTree();
  const { getGuiStateId } = useGuiStateId();

  const [uiButtonPlacement, setUiButtonPlacement] = useState(2);
  const [uiButtonPlacementRight, setUiButtonPlacementRight] = useState(2);

  const startWalkthrough = useCallback(async () => {
    const initialGuiState = await getCurrentGuiState(
      firstParent,
      XPATH_ID_BASE + "/div",
      state,
      typeMap,
      currentRoute.pathname
    );

    console.log(initialGuiState);

    const guiStateId = await getGuiStateId(state, initialGuiState);

    dispatch({ type: ReducerActionEnum.START_WALKTHROUGH });

    dispatch({
      type: ReducerActionEnum.UPDATE_ACTIONS,
      newUserAction: {
        action: {
          actionType: PossibleAction.START_WALKTHROUGH,
          timestamp: new Date().getTime(),
          elementId: "start-walkthrough-button",
          nextState: {
            widgetArray: initialGuiState ? initialGuiState : [],
            currentRoute: currentRoute.pathname,
            stateId: guiStateId,
          },
          prevState: {
            widgetArray: initialGuiState ? initialGuiState : [],
            currentRoute: currentRoute.pathname,
            stateId: guiStateId,
          },
        },
        prevActionWasRouting: false,
      },
    });

    saveCurrentGuiState(
      initialGuiState,
      currentRoute.pathname,
      state,
      guiStateId
    );
  }, [
    firstParent,
    getCurrentGuiState,
    saveCurrentGuiState,
    state,
    typeMap,
    currentRoute.pathname,
    getGuiStateId,
  ]);

  const endWalkthrough = useCallback(async () => {
    const finalGuiState = await getCurrentGuiState(
      firstParent,
      XPATH_ID_BASE,
      state,
      typeMap,
      currentRoute.pathname
    );

    const guiStateId = await getGuiStateId(state, finalGuiState);

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
          nextState: {
            widgetArray: finalGuiState ? finalGuiState : [],
            currentRoute: currentRoute.pathname,
            stateId: guiStateId,
          },
          prevState: {
            widgetArray: finalGuiState ? finalGuiState : [],
            currentRoute: currentRoute.pathname,
            stateId: guiStateId,
          },
        },
        prevActionWasRouting: prevActionWasRouting,
      },
    });

    saveCurrentGuiState(
      finalGuiState,
      currentRoute.pathname,
      state,
      guiStateId
    );
  }, [
    firstParent,
    getCurrentGuiState,
    saveCurrentGuiState,
    state,
    typeMap,
    currentRoute.pathname,
    getGuiStateId,
  ]);

  return (
    <div
      style={{
        position: "absolute",
        right: `${uiButtonPlacementRight}%`,
        top: `${uiButtonPlacement}%`,
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
