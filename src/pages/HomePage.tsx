import * as React from "react";
import { Link } from "react-router-dom";
import { CustomButton } from "../components/Provider/Provider";
import ComponentTest from "../components/ComponentTest";
import { FaInbox } from "react-icons/fa";
import { useState } from "react";

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
        <input />
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
