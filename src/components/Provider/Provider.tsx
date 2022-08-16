import React, {
  createContext,
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

export const XPATH_ID_BASE = "/html/body/div";

/**Context to save GUI state data in global state*/
export const DataContext = createContext<{
  state: ReducerState;
  dispatch: React.Dispatch<ActionType>;
  saveCurrentGuiState: (currentGuiState: Widget[] | null | undefined) => void;
  firstParent: React.ReactNode | React.ReactNode[];
}>({
  state: { actions: [], ids: new Map(), refs: new Map(), guiStates: [] },
  dispatch: () => {},
  saveCurrentGuiState: () => {},
  firstParent: undefined,
});

const Provider = ({
  children,
}: {
  children?: React.ReactNode | React.ReactNode[];
}) => {
  const { getSubTree, getFunctionalComponentTypes, getCurrentGuiState } =
    useSubTree();

  const reducerKey = "PROVIDER_STATE";
  const { state, dispatch } = usePersistedReducer(
    reducer,
    initialState,
    reducerKey
  );

  /** saves current state in global storage */
  const saveCurrentGuiState = useCallback(
    (currentGuiState: Widget[] | null | undefined) => {
      if (currentGuiState) {
        console.log(currentGuiState);
        dispatch({
          type: ReducerActionEnum.UPDATE_GUI_STATES,
          newGuiState: { widgetArray: currentGuiState },
        });
      }
    },
    [dispatch]
  );

  //get type map for all functional components inside application
  const x = getFunctionalComponentTypes(children);
  const typeMap: Map<string | undefined, string> = getTypeMap(x);

  //TODO: Figure out why boundingHeight is not set here!!
  useEffect(() => {
    const initialGuiState = getCurrentGuiState(
      children,
      XPATH_ID_BASE,
      state,
      typeMap
    );
    saveCurrentGuiState(initialGuiState);
  }, []);

  return (
    <>
      <DataContext.Provider
        value={{ state, dispatch, saveCurrentGuiState, firstParent: children }}
      >
        <PrintDataButton />
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
        height: "100px",
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

type InputProps = {
  children?: React.ReactNode | React.ReactNode[];
  placeholder: string;
};

export const CustomInput = ({ children, placeholder }: InputProps) => {
  return <input placeholder={placeholder}>{children}</input>;
};

export default Provider;
