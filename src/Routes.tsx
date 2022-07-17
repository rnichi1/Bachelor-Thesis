import React from "react";
import { Router, Switch, Route, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { Provider } from "./components";

import { HomePage } from "./pages/HomePage";
import { SecondaryPage } from "./pages/SecondaryPage";

export const Routes = () => {
  const history = createBrowserHistory();
  return (
    <Router history={history}>
      <Provider>
        <Switch>
          <Redirect exact from="/" to="/home" />
          <Route path="/home" component={HomePage} />
          <Route path="/project" component={SecondaryPage} />
        </Switch>
      </Provider>
    </Router>
  );
};
