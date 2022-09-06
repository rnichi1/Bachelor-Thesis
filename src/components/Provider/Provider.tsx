import React, { createContext, useReducer, useState } from "react";
import { useSubTree } from "../../hooks/useSubTree";
import { initialState, reducer } from "../../reducer/reducer";
import { ActionType, ReducerState } from "../../types/reducerTypes";
import { Location } from "history";
import { RecordingMenu } from "../ui/RecordingMenu";

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
    refs: new Map(),
    guiStates: [],
    walkthroughActive: false,
  },
  dispatch: () => {},
  firstParent: undefined,
  currentRoute: { pathname: "/" } as Location<unknown>,
  firstXpathId: "",
});

/** The Provider component can be used to wrap Route components or any subtree of a React application to record actions done by a user.
 * @param currentRoute the Location object from react-router-dom must be passed into here to keep track of routes
 * @param children
 * @param firstXpathId the XPath of the first element in the subtree's DOM should be passed here. (You can find it by right clicking on the dom element in the developer console's inspector in Firefox and selecting copy > XPath)
 * */
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
        <RecordingMenu />
        {children
          ? getSubTree(children, dispatch, XPATH_ID_BASE, firstXpathId)
          : null}
      </DataContext.Provider>
    </>
  );
};

export default Provider;
