import React from "react";
import {
  CustomButton,
  CustomInput,
  PrintDataButton,
  Provider,
} from "./components/Provider";
import ClassComponentTest from "./components/ClassComponentTest";

function handleSubmit(e: { preventDefault: () => void }) {
  e.preventDefault();
  console.log("You clicked submit for the original function.");
}

function App() {
  return (
    <Provider>
      <a className="button" download="name.png">
        Download File
      </a>
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
      <ClassComponentTest />
    </Provider>
  );
}

export default App;
