import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debounceQuery, setDebounceQuery] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceQuery(value);
    }, delay);

    return () => clearInterval(timer);
  }, [value, delay]);

  return debounceQuery;
}

export default useDebounce;
