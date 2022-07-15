import * as React from "react";
import { Redirect, useHistory, Link, Route } from "react-router-dom";
import { SecondaryPage } from "./SecondaryPage";

export const HomePage = () => {
  return (
    <div>
      <div>this is the home page</div>
      <div>a second div</div>
      <div>
        <div>and fourth</div>
        <input />
      </div>
      <div>
        <div>and second nested div</div>
      </div>

      <Link to={"/project"}>
        <p>hi</p>
      </Link>
      <Route path="/project" component={SecondaryPage} />
    </div>
  );
};
