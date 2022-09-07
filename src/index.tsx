import App from "./App";
import React from "react";
import ReactDOM from "react-dom";
//import { createRoot } from "react-dom/client";

export * from "./components";

//For testing react 17 and lower in the local environment provided
ReactDOM.render(<App />, document.getElementById("root"));
