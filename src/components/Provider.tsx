import React from "react";
import { useSubTree } from "../hooks/useSubTree";
import { useVisualizeComponentTree } from "../hooks/useVisualizeComponentTree";

type Props = {
  children?: React.ReactNode | React.ReactNode[];
};

export const Provider = ({ children }: Props) => {
  const { getSubTree, ids } = useSubTree();
  console.log(ids);
  return <>{getSubTree(children)}</>;
};

export const CustomButton = ({ children }: Props) => {
  return <button>{children}</button>;
};

type InputProps = {
  children?: React.ReactNode | React.ReactNode[];
  placeholder: string;
};
export const CustomInput = ({ children, placeholder }: InputProps) => {
  return <input placeholder={placeholder}>{children}</input>;
};
