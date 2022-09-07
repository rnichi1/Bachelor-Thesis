import { useRef, useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
