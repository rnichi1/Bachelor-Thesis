import React from "react";
import { Router, Switch, Route, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";

import { HomePage } from "./pages/HomePage";
import { SecondaryPage } from "./pages/SecondaryPage";
import { Provider } from "./components";

export const Routes = () => {
  const history = createBrowserHistory();
  return (
    <Router history={history}>
      <Switch>
        <Redirect exact from="/" to="/home" />
        <Provider>
          <Route path="/home" component={HomePage} />
          <Route path="/project" component={SecondaryPage} />
        </Provider>
      </Switch>
    </Router>
  );
};
