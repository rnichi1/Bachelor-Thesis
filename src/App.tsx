import React from "react";
import { CustomButton, CustomInput, Provider } from "./components/Provider";

function handleSubmit(e: { preventDefault: () => void }) {
  e.preventDefault();
  console.log("You clicked submit for the original function.");
}

function App() {
  return (
    <Provider>
      <CustomButton>
        <div>
          <div>hello world</div>
        </div>
      </CustomButton>
      <div>
        <form onSubmit={handleSubmit}>
          <CustomInput placeholder={"email"} />
          <input placeholder={"password"} onInput={() => "first input"} />
          <button type={"submit"}> submit </button>
        </form>
      </div>
    </Provider>
  );
}

export default App;
