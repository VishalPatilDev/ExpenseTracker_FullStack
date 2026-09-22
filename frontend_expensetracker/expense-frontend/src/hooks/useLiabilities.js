import { useCallback, useEffect, useState } from "react";
import { getLiabilities } from "@/api/liabilityApi";

export function useLiabilities() {
  const [liabilities, setLiabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLiabilities();

      setLiabilities(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch liabilities"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    liabilities,
    loading,
    error,
    refetch,
  };
}
