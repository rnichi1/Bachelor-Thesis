import * as React from "react";
import { NavLink } from "react-router-dom";
import { CustomButton } from "../components/Provider/Provider";

export const HomePage = () => {
  return (
    <div>
      <div>this is the home page</div>
      <div>a second div</div>
      <div>
        <div>and fourth</div>
        <input />
        <input />
        <input />
      </div>
      <div>
        <div>and second nested div</div>
      </div>
      <CustomButton />

      <NavLink to={"/project"}>
        <p>hi</p>
      </NavLink>
    </div>
  );
};
