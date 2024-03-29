import React, { useCallback, useContext, useState } from "react";
import { useSubTree } from "../../hooks/useSubTree";
import { useGuiStateId } from "../../hooks/useGuiStateId";
import { ReducerActionEnum } from "../../reducer/reducer";
import { PossibleAction } from "../../types/actions";
import { DataContext } from "../DataContext";

/** UI for starting and ending a recording and for printing the collected data. This UI can be moved with the buttons provided, in case that it covers any relevant GUI elements. */
export const RecordingMenu = () => {
  let { state, firstParent, dispatch, currentRoute, firstXpathId } =
    useContext(DataContext);

  // custom hooks
  const { getCurrentGuiState } = useSubTree();
  const { getGuiStateId } = useGuiStateId();

  // variables for the placement of the UI
  const [uiButtonPlacement, setUiButtonPlacement] = useState(2);
  const [uiButtonPlacementRight, setUiButtonPlacementRight] = useState(2);

  /** starts a new recording */
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
          prevStateId: initialGuiState.stateId,
          nextStateId: initialGuiState.stateId,
          elementId: "start-walkthrough-button",
          nextState: initialGuiState,
          prevState: initialGuiState,
          wasPropagated: false,
          timestamp: new Date().getTime(),
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

  /** ends a recording */
  const endWalkthrough = useCallback(async () => {
    const finalGuiState = await getCurrentGuiState(
      firstXpathId,
      state,
      currentRoute.pathname
    );

    /** Previous state recorded by the last action */
    const prevGuiState = state.actions[state.actions.length - 1]?.nextState;

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
          prevStateId: prevGuiState.stateId,
          nextStateId: finalGuiState.stateId,
          elementId: "end-walkthrough-button",
          prevState: prevGuiState,
          nextState: finalGuiState,
          wasPropagated: false,
          timestamp: new Date().getTime(),
        },
        prevActionWasRouting: prevActionWasRouting,
      },
    });

    // save the current gui state in the global storage
    dispatch({
      type: ReducerActionEnum.UPDATE_GUI_STATES,
      newGuiState: finalGuiState,
    });

    // save the current action sequence
    dispatch({
      type: ReducerActionEnum.ADD_NEW_WALKTHROUGH,
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
          state.walkthroughActive &&
            console.log("current full action sequence: ", state.actions);
          state.walkthroughActive &&
            console.log(
              "current action sequence without propagated actions: ",
              state.actions.filter((a) => {
                return !a.wasPropagated;
              })
            );
          console.log("encountered GUI States: ", state.guiStates);
          console.log(
            "previously recorded action sequences: ",
            state.previousWalkthroughs
          );
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
        Start Recording
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
        End Recording
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
