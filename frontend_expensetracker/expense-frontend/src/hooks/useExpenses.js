import { useState, useEffect, useCallback } from "react";
import { getExpenses } from "@/api/expenseApi";
import { unwrap } from "@/utils/formatters";

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getExpenses();
      setExpenses(unwrap(res));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { expenses, loading, error, refetch: fetch };
}