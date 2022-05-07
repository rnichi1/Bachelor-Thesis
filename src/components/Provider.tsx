import React from "react";
import { useSubTree } from "../hooks/useSubTree";

type Props = {
  children: React.ReactNode | React.ReactNode[];
};

export const Provider = ({ children }: Props) => {
  const { getSubTree, getChildren } = useSubTree();
  console.log(getChildren(children));
  return <>{getSubTree(children)}</>;
};
