import * as React from "react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

const FLEX_STYLE = {
  display: "flex",
  justifyContent: "center",
  flex: "1",
  alignContent: "center",
  paddingBottom: "20px",
};

/** Testing page for the presentation of the capabilities of this library */
export const SecondaryPage = () => {
  const [currentButton, setCurrentButton] = useState(0);

  return (
    <div>
      <div style={{ ...FLEX_STYLE, fontSize: "30px", fontWeight: "bold" }}>
        This is the second page
      </div>
      <div style={FLEX_STYLE}>the button last pressed was: {currentButton}</div>
      <div style={FLEX_STYLE}>
        <div
          style={{
            display: "flex",
            border: "1px solid black",
            padding: "5px",
            maxWidth: "400px",
          }}
        >
          <button
            style={{ padding: "5px", margin: "5px" }}
            onClick={() => {
              setCurrentButton(1);
            }}
          >
            button1
          </button>
          <button
            style={{ padding: "5px", margin: "5px" }}
            onClick={() => {
              setCurrentButton(2);
            }}
          >
            button2
          </button>
          <button
            style={{ padding: "5px", margin: "5px" }}
            onClick={() => {
              setCurrentButton(3);
            }}
          >
            button3
          </button>
        </div>
      </div>
      <div style={FLEX_STYLE}>
        Press any of the above buttons to change the counter to its number.
      </div>
      <div style={FLEX_STYLE}>
        Due to the hovering style of the buttons, each combination between the
        current button counter and hovered on button yields a different GUI
        state.
      </div>
      <div style={FLEX_STYLE}>
        <Link to={"/home"}>
          <p>Return to home page</p>
        </Link>
      </div>
    </div>
  );
};
