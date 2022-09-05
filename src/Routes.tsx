import React from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";

import { Provider } from "./components";

import { HomePage } from "./pages/HomePage";
import { SecondaryPage } from "./pages/SecondaryPage";

//can be used for testing locally
export const Routes = () => {
  const location = useLocation();
  return (
    <Switch>
      <Redirect exact from="/" to="/home" />
      <Provider currentRoute={location} firstXpathId={"/html/body/div/div"}>
        <Route path="/home" component={HomePage} />
        <Route path="/project" component={SecondaryPage} />
      </Provider>
    </Switch>
  );
};
