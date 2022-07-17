import React, { createContext, useContext } from "react";
import { useSubTree } from "../../hooks/useSubTree";
import { action } from "../../types/actions";
import {
  initialState,
  reducer,
  ReducerActionEnum,
} from "../../reducer/reducer";
import { usePersistedReducer } from "../../hooks/usePersistedReducer";
import { ReducerState } from "../../types/reducerTypes";

//Context to save GUI state data in global state
export const DataContext = createContext<{
  state: ReducerState;
  dispatch: React.Dispatch<{
    type: ReducerActionEnum;
    newUserAction?: action | undefined;
    newIdObject?: { id: string; element: React.ReactNode } | undefined;
  }>;
}>({ state: { actions: [], ids: new Map() }, dispatch: () => {} });

const Provider = ({
  children,
}: {
  children?: React.ReactNode | React.ReactNode[];
}) => {
  const { getSubTree } = useSubTree();

  const reducerKey = "PROVIDER_STATE";
  const { state, dispatch } = usePersistedReducer(
    reducer,
    initialState,
    reducerKey
  );

  return (
    <>
      <DataContext.Provider value={{ state, dispatch }}>
        <PrintDataButton />
        {children ? getSubTree(children, dispatch, "providerId") : null}
      </DataContext.Provider>
    </>
  );
};

export const CustomButton = () => {
  return (
    <button>
      <div>this is a custom button, can you see its child div?</div>
    </button>
  );
};

//Button to test functionality in console (log saved state information)
export const PrintDataButton = ({
  children,
}: {
  children?: React.ReactNode | React.ReactNode[];
}) => {
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
