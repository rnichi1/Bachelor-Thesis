import React, { createContext, useContext, useReducer } from "react";
import { useSubTree } from "../hooks/useSubTree";
import { action } from "../types/actions";
import {
  initialState,
  reducer,
  ReducerActionEnum,
  ReducerState,
} from "../reducer/reducer";

type Props = {
  children?: React.ReactNode | React.ReactNode[];
};

//Context to save GUI state data in global state
export const DataContext = createContext<{
  state: ReducerState;
  dispatch: React.Dispatch<{
    type: ReducerActionEnum;
    newUserAction?: action | undefined;
    newIdObject?: { id: string; element: React.ReactNode } | undefined;
  }>;
}>({ state: { actions: [], ids: new Map() }, dispatch: () => {} });

export const Provider = ({ children }: Props) => {
  const { getSubTree } = useSubTree();

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <DataContext.Provider value={{ state, dispatch }}>
        <PrintDataButton />
        {children ? getSubTree(children) : null}
      </DataContext.Provider>
    </>
  );
};

export const CustomButton = ({ children }: Props) => {
  return <button>{children}</button>;
};

export const PrintDataButton = ({ children }: Props) => {
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
