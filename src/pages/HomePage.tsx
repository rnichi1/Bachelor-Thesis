import * as React from "react";
import { Link } from "react-router-dom";
import { CustomButton } from "../components/Provider/Provider";
import ComponentTest from "../components/ComponentTest";
import { FaInbox } from "react-icons/fa";

export const HomePage = () => {
  return (
    <div>
      <div>this is the home page</div>
      <div>a second div</div>

      <div></div>
      <ComponentTest>
        <div>hi this is a class</div>
      </ComponentTest>
      <div>
        <div>and fourth</div>
        <form
          style={{
            border: "solid 1px black",
            maxWidth: "400px",
            padding: "5px",
          }}
        >
          <div>this is a form</div>
          <input placeholder={"pls enter something"} />
          <button type={"submit"}>submit</button>
        </form>
        <input />
        <input />
      </div>
      <div>
        <FaInbox />
        <div>and second nested div</div>
      </div>
      <CustomButton exampleProp={"hi"} />

      <Link to={"/project"}>
        <p>hi</p>
      </Link>
    </div>
  );
};
