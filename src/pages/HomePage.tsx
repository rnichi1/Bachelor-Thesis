import * as React from "react";
import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <div>
      <div>
        <form
          style={{
            border: "solid 1px black",
            maxWidth: "400px",
            padding: "5px",
          }}
        >
          <div>this is a form</div>
          <input placeholder={"pls enter something"} />
          <button type={"submit"}>submit</button>
        </form>
        <input />
        <input />
      </div>
      <div>
        <div>and second nested div</div>
      </div>

      <Link to={"/project"}>
        <p>hi</p>
      </Link>
    </div>
  );
};
