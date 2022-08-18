import React, {
  createContext,
  Dispatch,
  SetStateAction,
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
import { getTypeMap } from "../../helpers/typeMap";
import { useLocation } from "react-router-dom";
import { useGuiStateId } from "../../hooks/useGuiStateId";
import { PossibleAction } from "../../types/actions";

export const XPATH_ID_BASE = "/html/body/div";

/**Context to save GUI state data in global state*/
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
  typeMap: Map<string | undefined, string>;
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
});

const Provider = ({
  children,
}: {
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
  const x = getFunctionalComponentTypes(children);
  const typeMap: Map<string | undefined, string> = getTypeMap(x);

  return (
    <>
      <DataContext.Provider
        value={{
          state,
          dispatch,
          saveCurrentGuiState,
          firstParent: children,
          typeMap: typeMap,
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

export const CustomButton = () => {
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
  const { state, firstParent, saveCurrentGuiState, typeMap, dispatch } =
    useContext(DataContext);

  //custom hooks
  const { getCurrentGuiState } = useSubTree();
  const { getGuiStateId } = useGuiStateId();

  const location = useLocation();

  const [uiButtonPlacement, setUiButtonPlacement] = useState(2);
  const [uiButtonPlacementRight, setUiButtonPlacementRight] = useState(2);

  const startWalkthrough = useCallback(async () => {
    const initialGuiState = await getCurrentGuiState(
      firstParent,
      XPATH_ID_BASE,
      state,
      typeMap,
      location.pathname
    );

    const guiStateId = await getGuiStateId(
      state,
      initialGuiState,
      location.pathname
    );

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
            currentRoute: location.pathname,
            stateId: guiStateId,
          },
          prevState: {
            widgetArray: initialGuiState ? initialGuiState : [],
            currentRoute: location.pathname,
            stateId: guiStateId,
          },
        },
        prevActionWasRouting: false,
      },
    });

    saveCurrentGuiState(initialGuiState, location.pathname, state, guiStateId);
  }, [
    firstParent,
    getCurrentGuiState,
    saveCurrentGuiState,
    state,
    typeMap,
    location.pathname,
    getGuiStateId,
  ]);

  const endWalkthrough = useCallback(async () => {
    const finalGuiState = await getCurrentGuiState(
      firstParent,
      XPATH_ID_BASE,
      state,
      typeMap,
      location.pathname
    );

    const guiStateId = await getGuiStateId(
      state,
      finalGuiState,
      location.pathname
    );

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
            currentRoute: location.pathname,
            stateId: guiStateId,
          },
          prevState: {
            widgetArray: finalGuiState ? finalGuiState : [],
            currentRoute: location.pathname,
            stateId: guiStateId,
          },
        },
        prevActionWasRouting: prevActionWasRouting,
      },
    });

    saveCurrentGuiState(finalGuiState, location.pathname, state, guiStateId);
  }, [
    firstParent,
    getCurrentGuiState,
    saveCurrentGuiState,
    state,
    typeMap,
    location.pathname,
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
