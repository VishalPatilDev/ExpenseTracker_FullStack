import { useState, useCallback } from "react";

/**
 * A thin wrapper that tracks loading / error state for an async function.
 *
 * Usage:
 *   const { execute, loading, error } = useAsync(myApiFn);
 *   await execute(arg1, arg2);
 */
export function useAsync(asyncFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFn(...args);
        return result;
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { execute, loading, error };
}