import { useEffect, useRef } from "react";

const useOutsideClick = (callback: () => void) => {
  const elementRef = useRef(null as any);
  const handleClick = (e: MouseEvent) => {
    if (elementRef.current && !elementRef.current.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });

  return elementRef;
};

export default useOutsideClick;
