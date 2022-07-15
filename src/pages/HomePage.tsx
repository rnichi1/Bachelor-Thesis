import * as React from "react";
import { Redirect, useHistory, Link, Route } from "react-router-dom";
import { SecondaryPage } from "./SecondaryPage";

export const HomePage = () => {
  return (
    <div>
      <div>this is the home page</div>
      <Link to={"/project"}>
        <p>hi</p>
      </Link>
      <Route path="/project" component={SecondaryPage} />
    </div>
  );
};
