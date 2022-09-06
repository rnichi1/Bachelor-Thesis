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
export const HomePage = () => {
  const [currentValue, setCurrentValue] = useState("");
  const [title, setTitle] = useState("Welcome!");
  const [showSurprise, setShowSurprise] = useState(false);

  return (
    <div>
      <div style={{ ...FLEX_STYLE, fontSize: "30px", fontWeight: "bold" }}>
        {title}
      </div>
      <div style={FLEX_STYLE}>
        <div>
          <form
            style={{
              border: "solid 1px black",
              maxWidth: "400px",
              padding: "5px",
            }}
          >
            <div style={{ paddingBottom: "10px" }}>this is a form</div>
            <input
              placeholder={"enter something"}
              value={currentValue}
              onChange={(v) => setCurrentValue(v.target.value)}
            />
            <button type={"submit"}>submit</button>
          </form>
        </div>
      </div>
      <div style={FLEX_STYLE}>
        <Link to={"/project"}>
          <p>Route to second page</p>
        </Link>
      </div>
      <div style={FLEX_STYLE}>
        <p style={{ paddingRight: "5px" }}>
          press this button to change the title of this page:
        </p>
        <button
          onClick={() => {
            setTitle("The GUI state should have changed with this action");
          }}
        >
          press me!
        </button>
      </div>
      <div
        style={FLEX_STYLE}
        onClick={() => {
          setShowSurprise(true);
        }}
      >
        <button>show surprise!</button>
      </div>
      {showSurprise && (
        <div style={FLEX_STYLE}>this is a conditionally rendered element</div>
      )}
    </div>
  );
};
