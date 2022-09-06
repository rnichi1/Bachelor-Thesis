import React, { useReducer } from "react";
import { useSubTree } from "../../hooks/useSubTree";
import { initialState, reducer } from "../../reducer/reducer";
import { Location } from "history";
import { RecordingMenu } from "../ui/RecordingMenu";
import { DataContext } from "../DataContext";

export const XPATH_ID_BASE = "/html/body/div";

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
  const { injectHoc } = useSubTree();

  /** reducer initialization */
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
          ? injectHoc(children, dispatch, XPATH_ID_BASE, firstXpathId)
          : null}
      </DataContext.Provider>
    </>
  );
};

export default Provider;
