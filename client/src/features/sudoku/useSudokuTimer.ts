import { useEffect, useRef, useState } from "react";

export function useSudokuTimer(running: boolean) {
  const startedAtRef = useRef<number | null>(null);

  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!running) {
      return;
    }

    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now() - elapsedMs;
    }

    const interval = setInterval(() => {
      if (startedAtRef.current === null) {
        return;
      }

      setElapsedMs(Date.now() - startedAtRef.current);
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [running]);

  function reset() {
    startedAtRef.current = Date.now();

    setElapsedMs(0);
  }

  return {
    elapsedMs,
    reset,
  };
}
