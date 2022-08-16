import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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
import { flatMap, map } from "lodash";
import { type } from "os";
import { getTypeMap } from "../../helpers/typeMap";
import { useLocation } from "react-router-dom";

export const XPATH_ID_BASE = "/html/body/div";

/**Context to save GUI state data in global state*/
export const DataContext = createContext<{
  state: ReducerState;
  dispatch: React.Dispatch<ActionType>;
  saveCurrentGuiState: (
    currentGuiState: Widget[] | null | undefined,
    currentRoute: string
  ) => void;
  firstParent: React.ReactNode | React.ReactNode[];
  typeMap: Map<string | undefined, string>;
}>({
  state: { actions: [], ids: new Map(), refs: new Map(), guiStates: [] },
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
  const { getSubTree, getFunctionalComponentTypes } = useSubTree();

  const reducerKey = "PROVIDER_STATE";
  const { state, dispatch } = usePersistedReducer(
    reducer,
    initialState,
    reducerKey
  );

  /** saves current state in global storage */
  const saveCurrentGuiState = useCallback(
    (currentGuiState: Widget[] | null | undefined, currentRoute: string) => {
      if (currentGuiState) {
        dispatch({
          type: ReducerActionEnum.UPDATE_GUI_STATES,
          newGuiState: {
            widgetArray: currentGuiState,
            currentRoute: currentRoute,
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
        <PrintDataButton />
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
        console.log("color should change");
      }}
    >
      <div>this is a custom button, can you see its child div?</div>
      <div>this is a custom button, can you see its child div?</div>
    </button>
  );
};

/**Button to test functionality in console (log saved state information)*/
export const PrintDataButton = () => {
  const { state } = useContext(DataContext);

  return (
    <button
      style={{
        position: "absolute",
        right: 10,
        top: 50,
        width: "100px",
        height: "50px",
      }}
      onClick={() => {
        console.log("current action data", state.actions);
        console.log("current component ids", state.ids);
        console.log("current refs", state.refs);
        console.log("encountered Gui States", state.guiStates);
      }}
    >
      Print Data to Console
    </button>
  );
};

/** Button that records first gui state and starts walkthrough for the user */
export const StartWalkthroughButton = () => {
  const { state, firstParent, saveCurrentGuiState, typeMap } =
    useContext(DataContext);
  const { getCurrentGuiState } = useSubTree();

  const location = useLocation();

  const startWalkthrough = useCallback(() => {
    const initialGuiState = getCurrentGuiState(
      firstParent,
      XPATH_ID_BASE,
      state,
      typeMap,
      location.pathname
    );

    saveCurrentGuiState(initialGuiState, location.pathname);
  }, []);

  return (
    <button
      style={{
        position: "absolute",
        right: 10,
        top: 110,
        width: "100px",
        height: "40px",
      }}
      onClick={startWalkthrough}
    >
      Start Walkthrough
    </button>
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
