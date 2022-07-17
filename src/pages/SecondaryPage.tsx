import * as React from "react";
import { Link } from "react-router-dom";

export const SecondaryPage = () => {
  return (
    <div>
      <div>this is the secondary page</div>
      <Link to={"/home"}>
        <p>go to home</p>
      </Link>
      <button>this is a button</button>
    </div>
  );
};
