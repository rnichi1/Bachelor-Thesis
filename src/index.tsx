import App from "./App";
import React from "react";
import ReactDOM from "react-dom";
//import { createRoot } from "react-dom/client";

export * from "./components";

/* For testing react 18 and higher
const container = document.getElementById("root");

// Create a root.
const root = createRoot(container!);

// Initial render
root.render(<App />);*/

//For testing react 17 and lower
ReactDOM.render(<App />, document.getElementById("root"));
