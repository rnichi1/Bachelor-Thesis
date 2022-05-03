import React from "react";
import { Provider } from "./components/Provider";

function App() {
  return (
    <Provider>
      <button>
        <div>
          <div>hello world</div>
        </div>
      </button>
      <div>
        <div>
          <input />
        </div>
      </div>
    </Provider>
  );
}

export default App;
