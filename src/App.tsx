import React from "react";
import { Provider } from "./components/Provider";

function App() {
  return (
    <Provider>
      <button>
        <p>hello world</p>
      </button>
      <button>hello world nr 2</button>
    </Provider>
  );
}

export default App;
