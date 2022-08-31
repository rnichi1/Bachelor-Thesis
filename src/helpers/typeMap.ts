import { ReactNode } from "react";

export type TypeMapValueType = { type: string; children: ReactNode[] };

type ChildrenArrayType =
  | { childrenTypes: any; name?: string; type?: any; children?: ReactNode[] }[]
  | null
  | undefined;

/** creates a map out of a nested array with objects with types of all functional components inside the app */
export const getTypeMap = (array: ChildrenArrayType) => {
  const typeMap = new Map();

  /** traverses through the nested array and checks for types to add to map */
  const addEntriesToMap = (children: ChildrenArrayType) => {
    if (Array.isArray(children)) {
      for (let i = 0; i < children?.length; i++) {
        if (children[i].name && children[i].type) {
          if (!typeMap.has(children[i].name)) {
            typeMap.set(children[i].name, {
              type: children[i].type,
              children: children[i].children,
            });
          } else {
            console.log(
              "please name all functional components with different types uniquely, for this library to display data correctly."
            );
          }
        }
        addEntriesToMap(children[i].childrenTypes);
      }
    }
  };
  addEntriesToMap(array);

  return typeMap;
};
