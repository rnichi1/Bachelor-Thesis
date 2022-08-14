/** creates a map out of a nested array with objects with types of all functional components inside the app */
export const getTypeMap = (
  x:
    | (
        | { name: string; type: any; childrenTypes: any }
        | { childrenTypes: any; name?: undefined; type?: undefined }
      )[]
    | null
    | undefined
) => {
  const typeMap = new Map();

  /** traverses through the nested array and checks for types to add to map */
  const addEntriesToMap = (children: typeof x) => {
    if (Array.isArray(children)) {
      for (let i = 0; i < children?.length; i++) {
        if (children[i].name && children[i].type) {
          if (!typeMap.has(children[i].name)) {
            typeMap.set(children[i].name, children[i].type);
          } else {
            console.log(
              "please name all functional components uniquely, for this library to display xpath id's correctly."
            );
          }
        }
        addEntriesToMap(children[i].childrenTypes);
      }
    }
  };
  addEntriesToMap(x);

  return typeMap;
};
