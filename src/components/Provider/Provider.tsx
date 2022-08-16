import React, { createContext, MutableRefObject, useContext } from "react";
import { useSubTree } from "../../hooks/useSubTree";
import { Action } from "../../types/actions";
import {
  initialState,
  reducer,
  ReducerActionEnum,
} from "../../reducer/reducer";
import { usePersistedReducer } from "../../hooks/usePersistedReducer";
import { ReducerState } from "../../types/reducerTypes";

const XPATH_ID_BASE = "/html/body/div";

/**Context to save GUI state data in global state*/
export const DataContext = createContext<{
  state: ReducerState;
  dispatch: React.Dispatch<{
    type: ReducerActionEnum;
    newUserAction?: Action | undefined;
    newIdObject?: { id: string; element: React.ReactNode } | undefined;
    newRefObject?: { id: string; ref: MutableRefObject<undefined> };
  }>;
}>({
  state: { actions: [], ids: new Map(), refs: new Map() },
  dispatch: () => {},
});

const Provider = ({
  children,
}: {
  children?: React.ReactNode | React.ReactNode[];
}) => {
  const { getSubTree, getCurrentGuiState } = useSubTree();

  const reducerKey = "PROVIDER_STATE";
  const { state, dispatch } = usePersistedReducer(
    reducer,
    initialState,
    reducerKey
  );

  const currentGuiState = getCurrentGuiState(children, XPATH_ID_BASE, state);

  console.log(state.refs);
  return (
    <>
      <DataContext.Provider value={{ state, dispatch }}>
        <PrintDataButton />
        {children ? getSubTree(children, dispatch, XPATH_ID_BASE) : null}
      </DataContext.Provider>
    </>
  );
};

export const CustomButton = () => {
  return (
    <div>
      <button style={{}}>
        <div>this is a custom button, can you see its child div?</div>
        <div>this is a custom button, can you see its child div?</div>
      </button>
    </div>
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
