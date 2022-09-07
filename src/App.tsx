import React from "react";
import { Routes } from "./Routes";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

const App = () => {
  const history = createBrowserHistory();

  return (
    <Router history={history}>
      <Routes />
    </Router>
  );
};

export default App;
