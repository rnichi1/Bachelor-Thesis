import App from "./App";
import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

export * from "./components";

const container = document.getElementById("root");

// Create a root.
const root = createRoot(container!);

// Initial render
root.render(<App />);
